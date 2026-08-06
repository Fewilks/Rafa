import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures an HTML element and generates a downloadable PDF file using html2canvas & jsPDF.
 */
export const downloadElementAsPDF = async (
  element: HTMLElement,
  fileName: string = 'documento-veterinario.pdf'
): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution capture
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1024,
      onclone: (clonedDoc, clonedElement) => {
        // Ensure cloned element is placed visibly at top left of virtual canvas
        if (clonedElement) {
          clonedElement.style.position = 'static';
          clonedElement.style.left = '0';
          clonedElement.style.top = '0';
          clonedElement.style.margin = '0';
          clonedElement.style.transform = 'none';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.display = 'block';
          clonedElement.style.opacity = '1';
        }

        // Also ensure wrapper container in cloned document is visible
        const wrapper = clonedElement?.parentElement;
        if (wrapper) {
          wrapper.style.position = 'static';
          wrapper.style.left = '0';
          wrapper.style.top = '0';
          wrapper.style.visibility = 'visible';
          wrapper.style.display = 'block';
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF com jsPDF e html2canvas:', error);
    throw error;
  }
};
