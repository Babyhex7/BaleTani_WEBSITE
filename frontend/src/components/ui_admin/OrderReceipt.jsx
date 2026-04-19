/**
 * Order Receipt Component
 * Thermal Receipt - 80mm width (±300px)
 * Optimized untuk thermal receipt printer
 */

import { useRef } from "react";
import { Printer, Download } from "lucide-react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

const OrderReceipt = ({ order, onClose }) => {
  const receiptRef = useRef(null);

  const formatCurrency = (amount) => {
    const n = typeof amount === "number" ? amount : Number(amount);
    const safe = Number.isFinite(n) ? n : 0;
    return safe.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Fungsi untuk format line dengan right align
  const formatLine = (left, right, width = 32) => {
    const leftStr = String(left);
    const rightStr = String(right);
    const spaces = Math.max(1, width - leftStr.length - rightStr.length);
    return leftStr + " ".repeat(spaces) + rightStr;
  };

  // Fungsi untuk truncate nama produk agar tetap dalam 1 baris
  const truncateProductName = (name, maxLength = 24) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 2) + "..";
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    const receiptHTML = receiptRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Struk Order ${order.order_number}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
          
          body {
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 20px;
            background: #f5f5f5;
            font-family: 'Courier New', 'Courier', monospace;
          }
          
          .receipt-container {
            width: 300px;
            background: white;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .receipt-content {
            padding: 8px;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
              display: block;
            }
            .receipt-container {
              width: 80mm;
              box-shadow: none;
              padding: 0;
            }
            .receipt-content {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${receiptHTML}
        </div>
      </body>
      </html>
    `);

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 300], // 80mm width, auto height
      });

      const pageWidth = 80;
      const margin = 2;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = margin;

      // Helper function
      const addText = (text, options = {}) => {
        const {
          align = "left",
          fontSize = 9,
          bold = false,
          center = false,
        } = options;

        pdf.setFontSize(fontSize);
        pdf.setFont("courier", bold ? "bold" : "normal");

        const lines = pdf.splitTextToSize(text, contentWidth);
        lines.forEach((line) => {
          if (center) {
            const textWidth =
              (pdf.getStringUnitWidth(line) * fontSize) / pdf.internal.scaleFactor;
            const xPos = (contentWidth - textWidth) / 2 + margin;
            pdf.text(line, xPos, yPos);
          } else if (align === "right") {
            const textWidth =
              (pdf.getStringUnitWidth(line) * fontSize) / pdf.internal.scaleFactor;
            const xPos = pageWidth - margin - textWidth;
            pdf.text(line, xPos, yPos);
          } else {
            pdf.text(line, margin, yPos);
          }
          yPos += 4;
        });
      };

      // Header
      addText("BALETANI FRESH MARKET", {
        bold: true,
        fontSize: 11,
        center: true,
      });
      yPos += 1;

      // Separator
      addText("--------------------------------");
      yPos += 1;

      // Order Info
      addText(`Order ID : ${order.order_number}`);
      addText(`Tanggal  : ${formatDate(order.created_at)}`);
      addText(`Tipe     : ${order.order_type === "online" ? "Online" : "Offline"}`);
      yPos += 1;

      // Separator
      addText("--------------------------------");
      yPos += 1;

      // Customer Info
      addText(`Nama  : ${order.customer_name}`);
      addText(`Phone : ${order.customer_phone}`);
      yPos += 1;

      // Separator
      addText("--------------------------------");
      yPos += 1;

      // Items
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item) => {
          const productName = truncateProductName(item.product_name);
          addText(productName);
          const qty = `${item.quantity} x ${formatCurrency(item.final_price)}`;
          const subtotal = formatCurrency(item.subtotal);
          const spacing = Math.max(
            1,
            32 - qty.length - String(subtotal).length
          );
          addText(qty + " ".repeat(spacing) + subtotal);
          yPos += 0.5;
        });
      }
      yPos += 1;

      // Separator
      addText("--------------------------------");
      yPos += 1;

      // Totals
      const subtotalStr = formatCurrency(order.item_subtotal);
      const subtotalLine = formatLine("Subtotal", subtotalStr);
      addText(subtotalLine);

      const deliveryStr = formatCurrency(order.delivery_fee || 0);
      const deliveryLine = formatLine("Delivery", deliveryStr);
      addText(deliveryLine);

      yPos += 1;

      // Separator
      addText("--------------------------------");
      yPos += 1;

      // Total
      const totalStr = formatCurrency(order.total_amount);
      const totalLine = formatLine("TOTAL", totalStr);
      addText(totalLine, { bold: true, fontSize: 10 });
      yPos += 1;

      // Separator & Payment
      addText("--------------------------------");
      yPos += 1;

      const paymentMethod = order.payment_method || "N/A";
      const paymentStatus =
        order.payment_status === "paid" ? "Paid" : "Unpaid";

      addText(`Payment : ${paymentMethod}`);
      addText(`Status  : ${paymentStatus}`);

      yPos += 1;

      // Separator
      addText("--------------------------------");
      yPos += 1;

      // Footer
      addText("Terima Kasih", { center: true, bold: true });

      yPos += 1;

      // Final Separator
      addText("--------------------------------");

      // Save
      pdf.save(`Struk-${order.order_number}.pdf`);
      toast.success("PDF berhasil diunduh!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal membuat PDF");
    }
  };

  return (
    <div className="space-y-4">
      {/* Thermal Receipt Preview - 80mm width */}
      <div
        ref={receiptRef}
        className="mx-auto"
        style={{
          width: "300px",
          maxWidth: "100%",
          fontFamily: "'Courier New', monospace",
          fontSize: "11px",
          lineHeight: "1.4",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ padding: "8px", whiteSpace: "pre-wrap" }}>
          {`        BALETANI FRESH MARKET
--------------------------------
Order ID : ${order.order_number}
Tanggal  : ${formatDate(order.created_at)}
Tipe     : ${order.order_type === "online" ? "Online" : "Offline"}

Nama  : ${order.customer_name}
Phone : ${order.customer_phone}
--------------------------------`}
          {order.orderItems && order.orderItems.length > 0
            ? order.orderItems
                .map((item) => {
                  const productName = truncateProductName(item.product_name);
                  const qty = `${item.quantity} x ${formatCurrency(item.final_price)}`;
                  const subtotal = `${formatCurrency(item.subtotal)}`;
                  const spacing = Math.max(
                    1,
                    32 - qty.length - subtotal.length
                  );
                  return `${productName}\n${qty}${" ".repeat(spacing)}${subtotal}`;
                })
                .join("\n")
            : "No items"}
          {`
--------------------------------
${formatLine("Subtotal", formatCurrency(order.item_subtotal), 32)}
${formatLine("Delivery", formatCurrency(order.delivery_fee || 0), 32)}
--------------------------------
${formatLine("TOTAL", formatCurrency(order.total_amount), 32)}

Payment : ${order.payment_method || "N/A"}
Status  : ${order.payment_status === "paid" ? "Paid" : "Unpaid"}
--------------------------------
      Terima Kasih 
--------------------------------`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-medium text-sm"
          >
            Close
          </button>
        )}
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <Printer className="w-5 h-5" />
          Print
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default OrderReceipt;
