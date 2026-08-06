import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures an HTML element and generates a downloadable PDF file using html2canvas & jsPDF.
 * Temporarily brings hidden/off-screen printable elements into the active layout to guarantee
 * non-blank high-resolution rendering.
 */
export const downloadElementAsPDF = async (
  element: HTMLElement,
  fileName: string = 'documento-veterinario.pdf'
): Promise<void> => {
  try {
    // Store original element styles to restore after capture
    const origPosition = element.style.position;
    const origLeft = element.style.left;
    const origTop = element.style.top;
    const origZIndex = element.style.zIndex;
    const origOpacity = element.style.opacity;
    const origVisibility = element.style.visibility;
    const origDisplay = element.style.display;

    // Save parent wrapper styles if any
    const parent = element.parentElement;
    const parentOrigPosition = parent ? parent.style.position : '';
    const parentOrigLeft = parent ? parent.style.left : '';
    const parentOrigTop = parent ? parent.style.top : '';
    const parentOrigZIndex = parent ? parent.style.zIndex : '';

    // Bring element into active layout temporarily
    if (parent) {
      parent.style.position = 'fixed';
      parent.style.left = '0';
      parent.style.top = '0';
      parent.style.zIndex = '9999';
    }

    element.style.position = 'fixed';
    element.style.left = '0';
    element.style.top = '0';
    element.style.zIndex = '9999';
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.display = 'block';

    // Allow browser layout pass
    await new Promise((resolve) => setTimeout(resolve, 60));

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution capture
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth || 800,
    });

    // Restore original element and parent styles immediately
    element.style.position = origPosition;
    element.style.left = origLeft;
    element.style.top = origTop;
    element.style.zIndex = origZIndex;
    element.style.opacity = origOpacity;
    element.style.visibility = origVisibility;
    element.style.display = origDisplay;

    if (parent) {
      parent.style.position = parentOrigPosition;
      parent.style.left = parentOrigLeft;
      parent.style.top = parentOrigTop;
      parent.style.zIndex = parentOrigZIndex;
    }

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
