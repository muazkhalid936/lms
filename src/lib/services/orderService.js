import jsPDF from 'jspdf';

class OrderService {
  static async getOrderHistory(params = {}) {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);

      const response = await fetch(`/api/orders?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order history');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while fetching order history'
      };
    }
  }

  static async getOrderDetails(orderId) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details');
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'An error occurred while fetching order details'
      };
    }
  }

  static formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  static formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  static getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'processing':
        return 'bg-blue-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      case 'failed':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  static async downloadReceipt(order) {
    await this.generateInvoicePDF(order);
  }

  static async generateInvoicePDF(order) {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Colors
      const primaryColor = '#392C7D';
      const lightGray = '#f8f9fa';
      const darkGray = '#333333';
      const mediumGray = '#666666';
      
      // Add logo/header background
      pdf.setFillColor(primaryColor);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Try to add logo
      try {
        // Create a canvas to convert SVG to image data URL
        const logoResponse = await fetch('/logo/white-logo.svg');
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const logoDataUrl = await this.blobToDataURL(logoBlob);
          pdf.addImage(logoDataUrl, 'PNG', 15, 10, 20, 20);
        }
      } catch (logoError) {
        console.warn('Could not load logo:', logoError);
      }
      
      // Company name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('DreamLMS', 40, 25);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text('Online Learning Platform', 40, 32);
      
      // Invoice title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('INVOICE', pageWidth - 60, 25);
      
      // Invoice details box
      const invoiceBoxY = 50;
      pdf.setFillColor(245, 245, 245);
      pdf.rect(pageWidth - 80, invoiceBoxY, 70, 40, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(darkGray);
      pdf.text('Invoice #:', pageWidth - 75, invoiceBoxY + 8);
      pdf.text('Date:', pageWidth - 75, invoiceBoxY + 18);
      pdf.text('Status:', pageWidth - 75, invoiceBoxY + 28);
      pdf.text('Payment:', pageWidth - 75, invoiceBoxY + 38);
      
      pdf.setFont(undefined, 'normal');
      pdf.text(order.orderId, pageWidth - 45, invoiceBoxY + 8);
      pdf.text(this.formatDate(order.enrolledAt), pageWidth - 45, invoiceBoxY + 18);
      
      // Status with color
      const statusColor = this.getStatusColorRGB(order.status);
      pdf.setTextColor(statusColor.r, statusColor.g, statusColor.b);
      pdf.text(order.status, pageWidth - 45, invoiceBoxY + 28);
      
      pdf.setTextColor(darkGray);
      pdf.text(order.paymentMethod, pageWidth - 45, invoiceBoxY + 38);
      
      // Customer information section
      const customerY = 105;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(primaryColor);
      pdf.text('Bill To:', 20, customerY);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(darkGray);
      pdf.text('Student Account', 20, customerY + 12);
      if (order.transactionId) {
        pdf.text(`Transaction ID: ${order.transactionId}`, 20, customerY + 22);
      }
      
      // Course details table
      const tableY = 150;
      
      // Table header
      pdf.setFillColor(primaryColor);
      pdf.rect(20, tableY, pageWidth - 40, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Course Description', 25, tableY + 10);
      pdf.text('Price', pageWidth - 80, tableY + 10);
      pdf.text('Amount', pageWidth - 40, tableY + 10);
      
      // Table content
      const rowY = tableY + 15;
      pdf.setFillColor(250, 250, 250);
      pdf.rect(20, rowY, pageWidth - 40, 30, 'F');
      
      pdf.setTextColor(darkGray);
      pdf.setFont(undefined, 'bold');
      pdf.setFontSize(11);
      
      // Course name (with text wrapping)
      const courseText = order.courseName || 'Course Name';
      const maxWidth = pageWidth - 140;
      const splitText = pdf.splitTextToSize(courseText, maxWidth);
      pdf.text(splitText, 25, rowY + 10);
      
      // Instructor info
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(mediumGray);
      pdf.text(`by ${order.instructorName || 'Unknown Instructor'}`, 25, rowY + 22);
      
      // Price and Amount columns
      pdf.setFontSize(10);
      pdf.setTextColor(darkGray);
      pdf.setFont(undefined, 'normal');
      
      if (order.isFreeCourse) {
        pdf.setTextColor(46, 125, 50); // Green color for free
        pdf.setFont(undefined, 'bold');
        pdf.text('FREE', pageWidth - 80, rowY + 10);
        pdf.text('FREE', pageWidth - 40, rowY + 10);
      } else {
        if (order.hasDiscount && order.originalAmount) {
          // Original price (crossed out)
          pdf.setTextColor(mediumGray);
          pdf.text(`$${order.originalAmount}`, pageWidth - 80, rowY + 8);
          
          // Draw line through original price
          const originalPriceWidth = pdf.getTextWidth(`$${order.originalAmount}`);
          pdf.line(pageWidth - 80, rowY + 6, pageWidth - 80 + originalPriceWidth, rowY + 6);
          
          // Discounted price
          pdf.setTextColor(220, 38, 38); // Red color for discount
          pdf.setFont(undefined, 'bold');
          pdf.text(this.formatCurrency(order.amount), pageWidth - 80, rowY + 15);
        } else {
          pdf.setTextColor(darkGray);
          pdf.text(this.formatCurrency(order.amount), pageWidth - 80, rowY + 10);
        }
        
        // Final amount
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(darkGray);
        pdf.text(this.formatCurrency(order.amount), pageWidth - 40, rowY + 10);
      }
      
      // Subtotal and Total section
      const subtotalY = rowY + 50;
      
      // Subtotal line
      pdf.setTextColor(mediumGray);
      pdf.setFont(undefined, 'normal');
      pdf.text('Subtotal:', pageWidth - 80, subtotalY);
      pdf.text(order.isFreeCourse ? 'FREE' : this.formatCurrency(order.amount), pageWidth - 40, subtotalY);
      
      // Discount line (if applicable)
      let discountY = subtotalY;
      if (order.hasDiscount && order.originalAmount && !order.isFreeCourse) {
        discountY += 10;
        pdf.setTextColor(220, 38, 38);
        pdf.text('Discount:', pageWidth - 80, discountY);
        const discountAmount = order.originalAmount - order.amount;
        pdf.text(`-${this.formatCurrency(discountAmount)}`, pageWidth - 40, discountY);
      }
      
      // Total section
      const totalY = discountY + 15;
      pdf.setFillColor(primaryColor);
      pdf.rect(pageWidth - 90, totalY - 5, 70, 18, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('TOTAL:', pageWidth - 85, totalY + 6);
      
      if (order.isFreeCourse) {
        pdf.text('FREE', pageWidth - 40, totalY + 6);
      } else {
        pdf.text(this.formatCurrency(order.amount), pageWidth - 40, totalY + 6);
      }
      
      // Footer
      const footerY = pageHeight - 50;
      pdf.setFillColor(245, 245, 245);
      pdf.rect(0, footerY, pageWidth, 50, 'F');
      
      // Footer content
      pdf.setTextColor(mediumGray);
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Thank you for choosing DreamLMS!', 20, footerY + 20);
      
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(9);
      pdf.text('Questions about your order? Contact support@dreamlms.com', 20, footerY + 30);
      pdf.text('Visit us at www.dreamlms.com for more courses', 20, footerY + 40);
      
      // Add page border
      pdf.setDrawColor(primaryColor);
      pdf.setLineWidth(1);
      pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      // Save the PDF
      const fileName = `DreamLMS-Invoice-${order.orderId}-${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text receipt
      this.downloadTextReceipt(order);
      return false;
    }
  }

  // Helper method to convert blob to data URL
  static blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Helper method to get RGB color for status
  static getStatusColorRGB(status) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { r: 34, g: 197, b: 94 }; // Green
      case 'pending':
        return { r: 251, g: 191, b: 36 }; // Yellow
      case 'processing':
        return { r: 59, g: 130, b: 246 }; // Blue
      case 'cancelled':
      case 'failed':
        return { r: 239, g: 68, b: 68 }; // Red
      default:
        return { r: 107, g: 114, b: 128 }; // Gray
    }
  }

  static downloadTextReceipt(order) {
    // Fallback text receipt (kept as backup)
    const receiptContent = `
      PURCHASE RECEIPT
      ================
      
      Order ID: ${order.orderId}
      Date: ${this.formatDate(order.enrolledAt)}
      
      Course: ${order.courseName}
      Amount: ${this.formatCurrency(order.amount)}
      Payment Method: ${order.paymentMethod}
      Status: ${order.status}
      
      Transaction ID: ${order.transactionId || 'N/A'}
      
      Thank you for your purchase!
    `;

    // Create and download the receipt
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${order.orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

}

export default OrderService;