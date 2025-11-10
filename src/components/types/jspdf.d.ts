// types/jspdf.d.ts
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
    autoTable: (options: any) => void;
  }
}