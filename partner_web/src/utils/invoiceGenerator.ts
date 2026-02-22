import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateInvoicePDF = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const options = {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc: Document) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.position = 'relative';
                    clonedElement.style.left = '0';
                    clonedElement.style.top = '0';
                    clonedElement.style.visibility = 'visible';
                    clonedElement.style.display = 'block';
                }

                // Clean up oklch colors which crash html2canvas
                const styles = clonedDoc.getElementsByTagName('style');
                for (let i = 0; i < styles.length; i++) {
                    const style = styles[i];
                    if (style.innerHTML.includes('oklch')) {
                        style.innerHTML = style.innerHTML.replace(/oklch\([^)]+\)/g, '#000000');
                    }
                }
            }
        };

        const canvas = await html2canvas(element, options);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = (pdf as jsPDF & { getImageProperties: (data: string) => { width: number; height: number } }).getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};
