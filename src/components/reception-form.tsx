// components/reception-form.tsx
import { useState } from 'react';
import { differenceInMonths } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Calculator, Package, Barcode, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage'; // Changé ici
import { useTheme } from '@/components/theme-provider';
import { useTranslation } from '@/lib/i18n';

type ReceptionFormProps = {
  onReceptionAdded: () => void;
};

type BadgeVariant = 'default' | 'destructive' | 'outline' | 'secondary';

export function ReceptionForm({ onReceptionAdded }: ReceptionFormProps) {
  const [productName, setProductName] = useState('');
  const [palletNumber, setPalletNumber] = useState('');
  const [cartons, setCartons] = useState('');
  const [unitsPerCarton, setUnitsPerCarton] = useState('');
  const [barcode, setBarcode] = useState('');
  const [productionDate, setProductionDate] = useState<Date>();
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const totalUnits = cartons && unitsPerCarton
    ? parseInt(cartons) * parseInt(unitsPerCarton)
    : 0;

  const shelfLifeMonths = productionDate && expirationDate
    ? differenceInMonths(expirationDate, productionDate)
    : 0;

  const calculateStatus = () => {
    if (!productionDate || !expirationDate) return translate('status.ok');

    const now = new Date();
    const oneThirdShelfLife = shelfLifeMonths / 3;
    const monthsSinceProduction = differenceInMonths(now, productionDate);

    if (now >= expirationDate) {
      return translate('status.expired');
    } else if (monthsSinceProduction >= oneThirdShelfLife) {
      return translate('status.passedThird');
    }
    return translate('status.ok');
  };

  const getStatusVariant = (status: string): BadgeVariant => {
    const okStatus = translate('status.ok');
    const passedStatus = translate('status.passedThird');
    const expiredStatus = translate('status.expired');
    
    if (status === expiredStatus) return 'destructive';
    if (status === passedStatus) return 'outline';
    return 'default';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productionDate || !expirationDate) {
      alert(translate('form.requiredDates'));
      return;
    }

    setIsSubmitting(true);

    try {
      const receptionData = {
        product_name: productName,
        pallet_number: palletNumber || null,
        cartons: parseInt(cartons),
        units_per_carton: parseInt(unitsPerCarton),
        total_units: totalUnits,
        barcode,
        production_date: format(productionDate, 'yyyy-MM-dd'),
        expiration_date: format(expirationDate, 'yyyy-MM-dd'),
        shelf_life_months: shelfLifeMonths,
        status: calculateStatus(),
        created_at: new Date().toISOString(),
      };

      storage.addReception(receptionData);
      
      // Réinitialiser le formulaire
      setProductName('');
      setPalletNumber('');
      setCartons('');
      setUnitsPerCarton('');
      setBarcode('');
      setProductionDate(undefined);
      setExpirationDate(undefined);
      
      onReceptionAdded();
    } catch (error) {
      alert(translate('form.addingError') || 'Erreur lors de l\'ajout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const handleDateInputChange = (type: 'production' | 'expiration', value: string) => {
    const date = value ? new Date(value) : undefined;
    if (type === 'production') {
      setProductionDate(date);
    } else {
      setExpirationDate(date);
    }
  };

  const isFormReady = productName && cartons && unitsPerCarton && barcode && productionDate && expirationDate;

  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/10 dark:to-indigo-950/10">
      <CardHeader className="pb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-bold">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Package className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              {translate('form.title')}
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Ajoutez de nouvelles réceptions de produits
              </p>
            </div>
          </CardTitle>
          <Badge variant="outline" className="text-base px-4 py-2">
            📦 Nouvelle Réception
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Informations Produit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Nom du produit */}
            <div className="space-y-3 lg:col-span-2">
              <Label htmlFor="productName" className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                {translate('form.productName')}
              </Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                placeholder={translate('form.productNamePlaceholder')}
                className="h-12 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-2"
              />
            </div>

            {/* Numéro de palette */}
            <div className="space-y-3">
              <Label htmlFor="palletNumber" className="text-base font-semibold flex items-center gap-2">
                <Palette className="h-4 w-4" />
                {translate('table.columns.palette')}
              </Label>
              <Input
                id="palletNumber"
                value={palletNumber}
                onChange={(e) => setPalletNumber(e.target.value)}
                placeholder="PAL-001"
                className="h-12 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-2 font-mono"
              />
            </div>

            {/* Code-barres */}
            <div className="space-y-3">
              <Label htmlFor="barcode" className="text-base font-semibold flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                {translate('form.barcode')}
              </Label>
              <Input
                id="barcode"
                maxLength={6}
                value={barcode}
                onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))}
                required
                placeholder={translate('form.barcodePlaceholder')}
                className="h-12 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-2 font-mono text-center"
              />
            </div>
          </div>

          {/* Section Quantités */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cartons */}
            <div className="space-y-3">
              <Label htmlFor="cartons" className="text-base font-semibold">
                {translate('form.cartons')}
              </Label>
              <Input
                id="cartons"
                type="number"
                min="1"
                value={cartons}
                onChange={(e) => setCartons(e.target.value)}
                required
                placeholder={translate('form.cartonsPlaceholder')}
                className="h-12 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-2 text-center"
              />
            </div>

            {/* Unités par carton */}
            <div className="space-y-3">
              <Label htmlFor="unitsPerCarton" className="text-base font-semibold">
                {translate('form.unitsPerCarton')}
              </Label>
              <Input
                id="unitsPerCarton"
                type="number"
                min="1"
                value={unitsPerCarton}
                onChange={(e) => setUnitsPerCarton(e.target.value)}
                required
                placeholder={translate('form.unitsPerCartonPlaceholder')}
                className="h-12 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-2 text-center"
              />
            </div>

            {/* Unités totales */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {translate('form.totalUnits')}
              </Label>
              <Input
                value={totalUnits.toLocaleString()}
                disabled
                className="h-12 text-base bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 font-bold text-blue-700 dark:text-blue-300 text-center"
              />
            </div>

            {/* Statut */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {translate('form.status')}
              </Label>
              <div>
                <Badge 
                  variant={getStatusVariant(calculateStatus())}
                  className="w-full justify-center py-3 text-base font-semibold"
                >
                  {calculateStatus()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Section Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date de production */}
            <div className="space-y-3">
              <Label htmlFor="productionDate" className="text-base font-semibold">
                {translate('form.productionDate')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="productionDate"
                  type="date"
                  value={formatDateForInput(productionDate)}
                  onChange={(e) => handleDateInputChange('production', e.target.value)}
                  className="h-12 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-2 flex-1"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 h-12 w-12">
                      <CalendarIcon className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={productionDate}
                      onSelect={setProductionDate}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Date d'expiration */}
            <div className="space-y-3">
              <Label htmlFor="expirationDate" className="text-base font-semibold">
                {translate('form.expirationDate')}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="expirationDate"
                  type="date"
                  value={formatDateForInput(expirationDate)}
                  onChange={(e) => handleDateInputChange('expiration', e.target.value)}
                  className="h-12 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200 border-2 flex-1"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 h-12 w-12">
                      <CalendarIcon className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expirationDate}
                      onSelect={setExpirationDate}
                      initialFocus
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Durée de vie */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {translate('form.shelfLife')}
              </Label>
              <Input
                value={`${shelfLifeMonths} mois`}
                disabled
                className="h-12 text-base bg-gray-50 dark:bg-gray-900/20 border-2 text-center"
              />
            </div>

            {/* Bouton d'action */}
            <div className="space-y-3 flex items-end">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200 text-base font-semibold"
                disabled={isSubmitting || !isFormReady}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {translate('form.adding')}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5" />
                    {translate('form.addButton')}
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Indicateur de progression */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
              <span className="text-blue-700 dark:text-blue-300 text-center sm:text-left">
                Tous les champs sont requis pour ajouter une réception
              </span>
              <Badge variant={isFormReady ? "default" : "secondary"}>
                {isFormReady ? "Prêt" : "En attente"}
              </Badge>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}