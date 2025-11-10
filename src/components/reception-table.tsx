// components/reception-table.tsx
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Search, Trash2, Download, Filter, ArrowUpDown, ChevronUp, ChevronDown, Package, Palette, Box, Calculator, Barcode, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { storage, Reception } from '@/lib/storage'; // Changé ici
import { useTheme } from '@/components/theme-provider';
import { useTranslation } from '@/lib/i18n';

// Import jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReceptionTableProps = {
  refreshTrigger: number;
};

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export function ReceptionTable({ refreshTrigger }: ReceptionTableProps) {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [filteredReceptions, setFilteredReceptions] = useState<Reception[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Reception>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { language } = useTheme();
  const t = useTranslation();
  
  const translate = (key: string) => {
    try {
      return t(language, key);
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  const fetchReceptions = () => {
    setIsLoading(true);
    try {
      const data = storage.getReceptions();
      const sorted = [...data].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReceptions(sorted);
      setFilteredReceptions(sorted);
    } catch (error) {
      console.error('Error fetching receptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptions();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = receptions.filter((reception) =>
      Object.values(reception).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(reception => reception.status === statusFilter);
    }

    setFilteredReceptions(filtered);
  }, [searchTerm, receptions, statusFilter]);

  const handleSort = (field: keyof Reception) => {
    const direction =
      sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...filteredReceptions].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredReceptions(sorted);
  };

  const handleDelete = (id: string) => {
    if (!confirm(translate('table.deleteConfirm'))) return;

    try {
      storage.deleteReception(id);
      fetchReceptions();
    } catch (error) {
      alert(translate('table.deleteError'));
    }
  };

  const getStatusVariant = (status: string): BadgeVariant => {
    const okStatus = translate('status.ok');
    const passedStatus = translate('status.passedThird');
    const expiredStatus = translate('status.expired');
    
    if (status === expiredStatus) return 'destructive';
    if (status === passedStatus) return 'outline';
    return 'default';
  };

  const getStatusIcon = (status: string) => {
    const okStatus = translate('status.ok');
    const passedStatus = translate('status.passedThird');
    const expiredStatus = translate('status.expired');
    
    switch (status) {
      case okStatus: return <CheckCircle className="h-4 w-4" />;
      case passedStatus: return <AlertTriangle className="h-4 w-4" />;
      case expiredStatus: return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const calculateTotalUnits = () => {
    return filteredReceptions.reduce((total, reception) => total + reception.total_units, 0);
  };

  const getSortIcon = (field: keyof Reception) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const totalUnits = calculateTotalUnits();
      
      // Titre principal
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(translate('pdf.title'), 105, 15, { align: 'center' });
      
      // Date de génération
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${translate('pdf.generatedOn')} ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 105, 22, { align: 'center' });
      
      // Résumé
      doc.setFontSize(11);
      doc.setTextColor(40);
      doc.text(`${translate('pdf.receptionsCount')}: ${filteredReceptions.length}`, 14, 35);
      doc.text(`${translate('pdf.totalUnits')}: ${totalUnits.toLocaleString()}`, 14, 42);

      // Préparer les données du tableau
      const headers = [
        translate('table.columns.product'),
        translate('table.columns.palette'),
        translate('table.columns.cartons'),
        translate('table.columns.unitsPerCarton'),
        translate('table.columns.totalUnits'),
        translate('table.columns.barcode'),
        translate('table.columns.production'),
        translate('table.columns.expiration'),
        translate('table.columns.status')
      ];

      const data = filteredReceptions.map(reception => [
        reception.product_name,
        reception.pallet_number || '-',
        reception.cartons.toString(),
        reception.units_per_carton.toString(),
        reception.total_units.toLocaleString(),
        reception.barcode,
        format(new Date(reception.production_date), 'dd/MM/yyyy'),
        format(new Date(reception.expiration_date), 'dd/MM/yyyy'),
        reception.status
      ]);

      // Utiliser autoTable directement
      autoTable(doc, {
        startY: 50,
        head: [headers],
        body: data,
        theme: 'grid',
        styles: { 
          fontSize: 8, 
          cellPadding: 2,
          textColor: [0, 0, 0]
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: [245, 245, 245] 
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 15 },
          2: { cellWidth: 12 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 15 },
          6: { cellWidth: 18 },
          7: { cellWidth: 18 },
          8: { cellWidth: 15 }
        }
      });

      // Ajouter le total général
      const finalY = (doc as any).lastAutoTable?.finalY + 10 || 100;
      doc.setFontSize(12);
      doc.setTextColor(41, 128, 185);
      doc.setFont(undefined, 'bold');
      doc.text(`${translate('pdf.generalTotal')}: ${totalUnits.toLocaleString()} ${translate('table.columns.totalUnits').toLowerCase()}`, 14, finalY);

      // Télécharger le PDF
      doc.save(`rapport-receptions-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert(translate('pdf.error'));
    }
  };

  const statusOptions = [
    { value: 'all', label: translate('common.allStatus') },
    { value: translate('status.ok'), label: translate('status.ok') },
    { value: translate('status.passedThird'), label: translate('status.passedThird') },
    { value: translate('status.expired'), label: translate('status.expired') },
  ];

  const statusLabel = statusOptions.find(opt => opt.value === statusFilter)?.label || translate('common.allStatus');

  return (
    <Card className="shadow-2xl border-0 mt-8">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              {translate('table.title')}
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Liste des réceptions enregistrées
              </p>
            </div>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barre de recherche */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={translate('table.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-11 focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-2"
              />
            </div>

            {/* Filtre par statut */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-11">
                  <Filter className="h-4 w-4" />
                  <span>{translate('common.status')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusOptions.map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={statusFilter === option.value ? 'bg-blue-50 text-blue-700' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bouton PDF */}
            <Button 
              onClick={generatePDF}
              disabled={filteredReceptions.length === 0}
              className="flex items-center gap-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              {translate('table.downloadPDF')}
            </Button>
          </div>
        </div>
        
        {/* Statistiques en temps réel */}
        {filteredReceptions.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border-2">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                  <Box className="h-7 w-7" />
                  {filteredReceptions.length}
                </div>
                <div className="text-sm text-blue-600/70 font-medium">
                  {translate('table.totalReceptions')}
                </div>
              </div>
              <div className="h-12 w-px bg-blue-200 dark:bg-blue-800"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 flex items-center gap-2">
                  <Calculator className="h-7 w-7" />
                  {calculateTotalUnits().toLocaleString()}
                </div>
                <div className="text-sm text-indigo-600/70 font-medium">
                  {translate('table.totalUnits')}
                </div>
              </div>
            </div>
            
            {statusFilter !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-2 px-4 py-2 text-base"
              >
                {translate('common.filter')}: {statusLabel}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-transparent"
                  onClick={() => setStatusFilter('all')}
                >
                  ×
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-muted-foreground text-lg">{translate('table.loading')}</div>
          </div>
        ) : filteredReceptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground text-lg mb-4">
              {searchTerm || statusFilter !== 'all' ? translate('table.noResults') : translate('table.noData')}
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {translate('common.resetFilters')}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  {[
                    { key: 'product_name', icon: <Package className="h-4 w-4" /> },
                    { key: 'pallet_number', icon: <Palette className="h-4 w-4" /> },
                    { key: 'cartons', icon: <Box className="h-4 w-4" /> },
                    { key: 'units_per_carton', icon: <Calculator className="h-4 w-4" /> },
                    { key: 'total_units', icon: <Calculator className="h-4 w-4" /> },
                    { key: 'barcode', icon: <Barcode className="h-4 w-4" /> },
                    { key: 'production_date', icon: <Calendar className="h-4 w-4" /> },
                    { key: 'expiration_date', icon: <Calendar className="h-4 w-4" /> },
                    { key: 'shelf_life_months', icon: <Calendar className="h-4 w-4" /> },
                    { key: 'status', icon: <AlertTriangle className="h-4 w-4" /> }
                  ].map(({ key, icon }) => (
                    <TableHead
                      key={key}
                      className="cursor-pointer hover:bg-muted transition-colors duration-150 font-semibold py-4"
                      onClick={() => handleSort(key as keyof Reception)}
                    >
                      <div className="flex items-center gap-2">
                        {icon}
                        {translate(`table.columns.${key}`)}
                        {getSortIcon(key as keyof Reception)}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold py-4">{translate('table.columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceptions.map((reception) => (
                  <TableRow 
                    key={reception.id} 
                    className="group hover:bg-muted/30 transition-colors duration-150"
                  >
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div className="max-w-[200px] truncate" title={reception.product_name}>
                          {reception.product_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="font-mono flex items-center gap-1 w-fit">
                        <Palette className="h-3 w-3" />
                        {reception.pallet_number || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-center font-semibold flex items-center justify-center gap-1">
                        <Box className="h-4 w-4 text-muted-foreground" />
                        {reception.cartons}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-center flex items-center justify-center gap-1">
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                        {reception.units_per_carton}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600 py-4">
                      <div className="text-center flex items-center justify-center gap-1">
                        <Calculator className="h-4 w-4" />
                        {reception.total_units.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <code className="bg-muted px-2 py-1 rounded text-sm flex items-center gap-1 w-fit">
                        <Barcode className="h-3 w-3" />
                        {reception.barcode}
                      </code>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(reception.production_date), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className={reception.status === translate('status.expired') ? 'text-red-600 dark:text-red-400 font-medium flex items-center gap-1' : 
                                   reception.status === translate('status.passedThird') ? 'text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1' : 
                                   'font-medium flex items-center gap-1'}>
                        <Calendar className="h-4 w-4" />
                        {format(new Date(reception.expiration_date), 'dd/MM/yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-center flex items-center justify-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {reception.shelf_life_months} mois
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={getStatusVariant(reception.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(reception.status)}
                        {reception.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reception.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Ligne du total */}
                <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 font-bold border-t-2">
                  <TableCell colSpan={4} className="text-right text-lg py-4">
                    {translate('table.generalTotal')} :
                  </TableCell>
                  <TableCell className="text-blue-600 text-lg py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Calculator className="h-5 w-5" />
                      {calculateTotalUnits().toLocaleString()} {translate('table.totalUnits').toLowerCase()}
                    </div>
                  </TableCell>
                  <TableCell colSpan={6}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}