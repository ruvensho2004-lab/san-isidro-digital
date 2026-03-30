import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportToExcel(data, filename, columns) {
  const ws = XLSX.utils.json_to_sheet(
    data.map(item => {
      const row = {}
      columns.forEach(col => {
        row[col.header] = col.accessor(item)
      })
      return row
    })
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Datos')
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function exportToPDF(data, filename, columns, title) {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text(title, 14, 22)
  doc.setFontSize(10)
  doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30)
  
  doc.autoTable({
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => col.accessor(item))),
    startY: 38,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [124, 92, 252] }
  })
  
  doc.save(`${filename}.pdf`)
}
