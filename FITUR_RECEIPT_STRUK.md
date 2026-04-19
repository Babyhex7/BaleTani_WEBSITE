# Panduan Fitur Order Receipt/Struk

## 📋 Deskripsi
Fitur ini memungkinkan admin untuk secara otomatis menampilkan, mencetak, dan mengunduh struk/receipt ketika order status berubah menjadi "Completed".

## 🚀 Cara Menggunakan

### 1. **Update Status Order menjadi Completed**
   - Buka Order Management page
   - Klik tombol "Update" pada order yang ingin diselesaikan
   - Modal "Update Order Status" akan terbuka
   - Ubah status menjadi "Completed"
   - Klik "Update Status"

### 2. **Receipt Modal Muncul Otomatis**
   - Setelah berhasil update status menjadi "Completed", modal struk akan otomatis muncul
   - Modal menampilkan format struk standar Baletani Fresh Market

### 3. **Print Struk**
   - Klik tombol **"Print"** untuk mengirim ke printer
   - Jendela print browser akan terbuka
   - Sesuaikan pengaturan printer dan klik "Print"

### 4. **Download PDF**
   - Klik tombol **"Download PDF"** untuk mengunduh struk dalam format PDF
   - File akan tersimpan dengan nama: `Struk-{ORDER_NUMBER}.pdf`
   - Contoh: `Struk-ORD-20260331-0370.pdf`

### 5. **Akses Receipt dari Detail Order**
   - Buka Order Management page
   - Klik "Detail" pada order terkait
   - Jika order sudah "Completed", akan ada tombol **"Lihat Struk"** di bagian bawah
   - Klik tombol tersebut untuk melihat receipt dengan opsi print/download

## 📄 Format Struk

```
        BALETANI FRESH MARKET
--------------------------------
Order ID : ORD-20260331-0370
Tanggal  : 31 Mar 2026 16:01
Tipe     : Offline

Nama  : qqq
Phone : 124343654745
--------------------------------
Mie Instan
20 x 3.000           60.000
--------------------------------
Subtotal             60.000
Delivery                 0
--------------------------------
TOTAL                60.000

Payment : Cash
Status  : Paid
Status  : Paid
--------------------------------
      Terima Kasih 
--------------------------------
```

## 🔧 Komponen yang Digunakan

### OrderReceipt.jsx
- Komponen utama untuk menampilkan struk
- Support print dan PDF download
- Format monospace (courier) untuk tampilan struk

### OrderReceiptModal.jsx
- Modal wrapper untuk OrderReceipt
- Menampilkan receipt dalam dialog yang responsif

### Update pada UpdateStatusModal.jsx
- Otomatis tampil receipt saat status → completed
- Integrasi seamless dengan update flow

### Update pada OrderDetailModal.jsx  
- Tambah tombol "Lihat Struk" untuk completed orders
- Akses facesillitas receipt dari halaman detail

## 💡 Tips Penggunaan

1. **Format PDF**: Struk akan diformat otomatis sesuai ukuran A4 dengan margin yang sesuai
2. **Print Settings**: Ketika print, pastikan margin minimal dan pastikan "Background Graphics" di-enable untuk tampilan optimal
3. **Nama File PDF**: Gunakan nama order number untuk mudah mengidentifikasi struk
4. **Data Dinamis**: Semua data order (customer, items, total, dll) secara otomatis tertarik dari database

## ✅ Fitur yang Sudah Terimplementasi

- ✅ Tampil receipt otomatis saat status → completed
- ✅ Tombol Print untuk cetak ke printer
- ✅ Tombol Download PDF
- ✅ Format struk sesuai spesifikasi
- ✅ Responsif di semua ukuran layar
- ✅ Akses receipt dari detail order
- ✅ Support offline & online orders
- ✅ Error handling & toast notifications

## 🔍 Troubleshooting

### Popup Diblokir Saat Print
- Pastikan popup tidak diblokir di browser settings
- Izinkan popup untuk domain aplikasi

### PDF Download Tidak Berfungsi
- Pastikan jsPDF library ter-load dengan benar
- Check browser console untuk error details
- Refresh halaman dan coba lagi

### Data Tidak Tampil Lengkap di Struk
- Pastikan order memiliki lengkap:
  - Customer name dan phone
  - Order items dengan quantity dan price
  - Delivery fee information
- Hubungi developer jika ada field yang missing

## 📱 Responsive Design
- ✅ Desktop: Full width modal dengan preview struk besar
- ✅ Tablet: Optimized layout dengan tombol actions yang mudah diakses
- ✅ Mobile: Stack layout dengan tombol full-width

## 🛠️ Customization (Jika Diperlukan)

Untuk mengubah format struk, edit file `/src/components/ui_admin/OrderReceipt.jsx`:
- Ubah text header/footer di bagian JSX
- Adjust font size/styling via Tailwind classes
- Modify PDF layout di fungsi `handleDownloadPDF`

---
*Last Updated: April 2026*
*Version: 1.0*
