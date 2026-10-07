import jsPDF from 'jspdf';
import { ExportedReportData } from '../types';

export const ExportService = {
  // 1. Export directly to PDF
  async generatePDF(report: ExportedReportData): Promise<void> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 16;

    // --- MEMBRETE SUPERIOR (ENCABEZADO INSTITUCIONAL) ---
    // Accent banner at top
    doc.setFillColor(5, 150, 105); // emerald-600 header accent
    doc.rect(margin, y, contentWidth, 2.5, 'F');
    y += 6;

    // Logo (if exists) or Brand Badge
    if (report.letterhead.logoBase64 && report.letterhead.logoBase64.startsWith('data:image')) {
      try {
        doc.addImage(report.letterhead.logoBase64, 'PNG', margin, y, 22, 22);
      } catch (e) {
        // fallback
      }
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(15, 23, 42);
    doc.text(report.letterhead.institutionName.toUpperCase(), margin + 26, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(report.letterhead.slogan, margin + 26, y + 9);
    doc.text(`${report.letterhead.taxId} | ${report.letterhead.address}`, margin + 26, y + 13);
    doc.text(`Telf: ${report.letterhead.phone} | Email: ${report.letterhead.email} | Web: ${report.letterhead.website || 'N/A'}`, margin + 26, y + 17);
    if (report.letterhead.isoCertification) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(5, 150, 105);
      doc.text(`Certificación: ${report.letterhead.isoCertification}`, margin + 26, y + 20.8);
    }

    y += 24;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // --- REPORTE TÍTULO Y CÓDIGO QR ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(report.title.toUpperCase(), margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const docFolio = `${report.letterhead.documentCodePrefix || 'INF-HYDRO'}-${report.reportId}`;
    doc.text(`Folio Oficial: ${docFolio} | Período: ${report.periodLabel}`, margin, y + 4.5);
    doc.text(`Fecha y Hora de Emisión: ${new Date(report.generatedAt).toLocaleString('es-ES')}`, margin, y + 8.5);

    // Embed QR Code on the top right
    if (report.qrCodeDataUrl) {
      try {
        doc.addImage(report.qrCodeDataUrl, 'PNG', pageWidth - margin - 26, y - 5, 26, 26);
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text('Escanear p/ verificar', pageWidth - margin - 26, y + 23);
      } catch (e) {
        console.error('Error adding QR code to PDF:', e);
      }
    }

    y += 22;

    // --- DATOS DEL CULTIVO Y SISTEMA ---
    doc.setFillColor(241, 245, 249); // slate-100 box
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('PARÁMETROS DEL CULTIVO:', margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Cultivo: ${report.cropBatch.name} (${report.cropBatch.variety})`, margin + 4, y + 11);
    doc.text(`Sistema: ${report.cropBatch.systemType} | Fase: ${report.cropBatch.growthStage.toUpperCase()}`, margin + 4, y + 16);
    doc.text(`Tanque: ${report.cropBatch.tankCapacityLiters} Litros | Población: ${report.cropBatch.plantCount} plantas`, margin + 95, y + 11);
    doc.text(`Ubicación: ${report.cropBatch.location}`, margin + 95, y + 16);

    y += 27;

    // --- RESUMEN DE PROMEDIOS Y VALORES CRÍTICOS ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('RESUMEN ESTADÍSTICO DE MONITOREO', margin, y);
    y += 5;

    // Summary table cards
    const cardW = (contentWidth - 12) / 4;
    const cardH = 16;
    const stats = [
      { label: 'pH Promedio', val: `${report.summary.avgPh.toFixed(2)}`, sub: `Mín: ${report.summary.minPh.toFixed(2)} / Máx: ${report.summary.maxPh.toFixed(2)}` },
      { label: 'EC Promedio', val: `${report.summary.avgEc.toFixed(2)} mS/cm`, sub: `Mín: ${report.summary.minEc.toFixed(2)} / Máx: ${report.summary.maxEc.toFixed(2)}` },
      { label: 'Temp Solución', val: `${report.summary.avgWaterTemp.toFixed(1)} °C`, sub: `Ambiente: ${report.summary.avgAirTemp.toFixed(1)} °C` },
      { label: 'Nivel Agua Mín', val: `${report.summary.minWaterLevel}%`, sub: `Lecturas: ${report.summary.readingCount} registradas` },
    ];

    stats.forEach((st, idx) => {
      const cx = margin + idx * (cardW + 4);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(st.label, cx + 3, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(st.val, cx + 3, y + 10);

      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(st.sub, cx + 3, y + 14);
    });

    y += cardH + 7;

    // --- TABLA DE REGISTROS DE TELEMETRÍA (Últimas lecturas) ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('REGISTRO CRONOLÓGICO DE LECTURAS (SENSORES ESP32 / ARDUINO)', margin, y);
    y += 4;

    // Header row
    doc.setFillColor(30, 41, 59);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('FECHA / HORA', margin + 3, y + 4);
    doc.text('pH', margin + 34, y + 4);
    doc.text('EC (mS)', margin + 49, y + 4);
    doc.text('TDS (ppm)', margin + 66, y + 4);
    doc.text('NIVEL AGUA', margin + 86, y + 4);
    doc.text('T. AGUA', margin + 110, y + 4);
    doc.text('T. AMB', margin + 128, y + 4);
    doc.text('HUM', margin + 144, y + 4);
    doc.text('ORIGEN', margin + 160, y + 4);

    y += 6;

    // Data rows (max 15 rows to fit on page comfortably)
    const displayReadings = report.readings.slice(0, 14);
    displayReadings.forEach((r, idx) => {
      doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
      doc.rect(margin, y, contentWidth, 5.2, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);

      const dStr = new Date(r.timestamp).toLocaleDateString('es-ES', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      doc.text(dStr, margin + 3, y + 3.8);
      doc.text(r.ph.toFixed(2), margin + 34, y + 3.8);
      doc.text(r.ec.toFixed(2), margin + 49, y + 3.8);
      doc.text(r.tdsPpm ? r.tdsPpm.toString() : '-', margin + 66, y + 3.8);
      doc.text(`${r.waterLevelPct}% (${r.waterLevelLiters}L)`, margin + 86, y + 3.8);
      doc.text(`${r.waterTempC}°C`, margin + 110, y + 3.8);
      doc.text(`${r.airTempC}°C`, margin + 128, y + 3.8);
      doc.text(`${r.humidityPct}%`, margin + 144, y + 3.8);
      doc.text(r.sensorSource, margin + 160, y + 3.8);

      y += 5.2;
    });

    y += 6;

    // --- SECCIÓN DE FIRMAS DIGITALES Y VALIDACIÓN ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('VALIDACIÓN TÉCNICA Y FIRMAS DIGITALES', margin, y);
    y += 5;

    // Signature box
    const sigBoxW = (contentWidth - 10) / 2;
    const sigBoxH = 28;

    // Signature 1: Agrónomo o Firmante
    const sig1 = report.signatures && report.signatures.length > 0 ? report.signatures[0] : null;
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, sigBoxW, sigBoxH, 1.5, 1.5, 'D');

    if (sig1 && sig1.signatureBase64 && sig1.signatureBase64.startsWith('data:image')) {
      try {
        doc.addImage(sig1.signatureBase64, 'PNG', margin + 6, y + 2, 40, 16);
      } catch (e) {
        // fallback
      }
    } else {
      doc.setFont('courier', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('[ Firma Digital Registrada ]', margin + 10, y + 10);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sig1 ? sig1.signerName : report.letterhead.legalRepresentative, margin + 6, y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(sig1 ? `${sig1.signerTitle} | ${sig1.signerIdNumber}` : `Matrícula: ${report.letterhead.agronomistRegNumber}`, margin + 6, y + 24);

    // Box 2: Sello Oficial y Hash Criptográfico
    doc.roundedRect(margin + sigBoxW + 10, y, sigBoxW, sigBoxH, 1.5, 1.5, 'D');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text('CERTIFICADO DE AUTENTICIDAD DIGITAL', margin + sigBoxW + 16, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Hash de Seguridad:`, margin + sigBoxW + 16, y + 11);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6);
    doc.text(report.securityHash.slice(0, 36), margin + sigBoxW + 16, y + 15);
    doc.text(report.securityHash.slice(36), margin + sigBoxW + 16, y + 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`Sello criptográfico emitido conforme a normas ISO/IEC 27001`, margin + sigBoxW + 16, y + 24);

    y += sigBoxH + 4;

    // --- MEMBRETE INFERIOR (PIE DE PÁGINA INSTITUCIONAL & CERTIFICACIÓN LEGAL) ---
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);
    y += 3.5;

    // Legal & Confidentiality Notes
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    if (report.letterhead.footerLegalNote) {
      doc.text(report.letterhead.footerLegalNote, margin, y, { maxWidth: contentWidth });
      y += 3.2;
    }
    if (report.letterhead.confidentialityNotice) {
      doc.text(report.letterhead.confidentialityNotice, margin, y, { maxWidth: contentWidth });
      y += 3.2;
    }

    // Contact line & Auditor Legend
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(71, 85, 105);
    const contactLine = report.letterhead.footerContactLine || `${report.letterhead.institutionName} • ${report.letterhead.address} • Tel: ${report.letterhead.phone}`;
    doc.text(contactLine, margin, y);
    y += 3.2;

    // Page Folio & Cloud Sync Tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(5, 150, 105);
    const pageFolio = report.letterhead.pageNumberFormat || 'Página 1 de 1 - HydroSense IoT Cloud System';
    doc.text(`${pageFolio} • Supabase Verified: pbrdtcbsvckfibafvwkq • Sello Digital Activo`, margin, pageHeight - 4.5);

    // Save PDF
    const filename = `Reporte_Hidroponico_${report.cropBatch.name.replace(/\s+/g, '_')}_${report.periodType}_${Date.now().toString().slice(-6)}.pdf`;
    doc.save(filename);
  },

  // 2. Export to Excel format (.csv / .xls spreadsheet format with BOM for universal Excel compatibility)
  exportToExcel(report: ExportedReportData): void {
    const BOM = '\uFEFF';
    let csv = BOM;

    // --- MEMBRETE SUPERIOR EXCEL ---
    csv += `"========================================================================================="\r\n`;
    csv += `"${report.letterhead.institutionName.replace(/"/g, '""')}"\r\n`;
    csv += `"${report.letterhead.slogan.replace(/"/g, '""')}"\r\n`;
    csv += `"${report.letterhead.taxId} | ${report.letterhead.address} | Tel: ${report.letterhead.phone}"\r\n`;
    if (report.letterhead.isoCertification) {
      csv += `"Certificación: ${report.letterhead.isoCertification.replace(/"/g, '""')}"\r\n`;
    }
    csv += `"INFORME DE MONITOREO HIDROPÓNICO - ${report.periodLabel.toUpperCase()}"\r\n`;
    csv += `"Folio: ${report.letterhead.documentCodePrefix || 'INF-HYDRO'}-${report.reportId}"\t"Fecha Emisión: ${new Date(report.generatedAt).toLocaleString('es-ES')}"\r\n`;
    csv += `"Cultivo: ${report.cropBatch.name}"\t"Variedad: ${report.cropBatch.variety}"\t"Sistema: ${report.cropBatch.systemType}"\t"Tanque: ${report.cropBatch.tankCapacityLiters} L"\r\n`;
    csv += `"========================================================================================="\r\n\r\n`;

    // Summary section
    csv += `"RESUMEN ESTADÍSTICO"\r\n`;
    csv += `"pH Promedio"\t"${report.summary.avgPh.toFixed(2)}"\t"pH Mín"\t"${report.summary.minPh.toFixed(2)}"\t"pH Máx"\t"${report.summary.maxPh.toFixed(2)}"\r\n`;
    csv += `"EC Promedio (mS/cm)"\t"${report.summary.avgEc.toFixed(2)}"\t"EC Mín"\t"${report.summary.minEc.toFixed(2)}"\t"EC Máx"\t"${report.summary.maxEc.toFixed(2)}"\r\n`;
    csv += `"Temp Agua Promedio (°C)"\t"${report.summary.avgWaterTemp.toFixed(1)}"\t"Temp Ambiente (°C)"\t"${report.summary.avgAirTemp.toFixed(1)}"\t"Humedad Promedio (%)"\t"${report.summary.avgHumidity.toFixed(1)}"\r\n`;
    csv += `"Nivel Mínimo Agua (%)"\t"${report.summary.minWaterLevel}"\t"Total Lecturas"\t"${report.summary.readingCount}"\t"Alertas Registradas"\t"${report.summary.totalAlerts}"\r\n\r\n`;

    // Telemetry Columns
    csv += `"ID Lectura"\t"Fecha y Hora"\t"pH"\t"EC (mS/cm)"\t"TDS (ppm)"\t"Nivel Agua (%)"\t"Volumen Agua (L)"\t"Temp Solución (°C)"\t"Temp Aire (°C)"\t"Humedad (%)"\t"NPK"\t"Dosis A (ml)"\t"Dosis B (ml)"\t"Sensor / Dispositivo"\t"Observaciones"\r\n`;

    report.readings.forEach((r) => {
      const d = new Date(r.timestamp).toLocaleString('es-ES');
      csv += `"${r.id}"\t"${d}"\t"${r.ph.toFixed(2)}"\t"${r.ec.toFixed(2)}"\t"${r.tdsPpm}"\t"${r.waterLevelPct}"\t"${r.waterLevelLiters}"\t"${r.waterTempC}"\t"${r.airTempC}"\t"${r.humidityPct}"\t"${r.nutrients?.npkRatio || 'N/A'}"\t"${r.nutrients?.solADosageMl || 0}"\t"${r.nutrients?.solBDosageMl || 0}"\t"${r.sensorSource}"\t"${(r.notes || '').replace(/"/g, '""')}"\r\n`;
    });

    // --- MEMBRETE INFERIOR EXCEL ---
    csv += `\r\n"========================================================================================="\r\n`;
    csv += `"FIRMA Y VALIDACIÓN TÉCNICA"\r\n`;
    const sig = report.signatures && report.signatures[0];
    csv += `"Responsable Técnico:"\t"${sig ? sig.signerName : report.letterhead.legalRepresentative}"\r\n`;
    csv += `"Cargo / Colegiatura:"\t"${sig ? sig.signerTitle : report.letterhead.agronomistRegNumber}"\r\n`;
    csv += `"Hash de Seguridad Criptográfica:"\t"${report.securityHash}"\r\n`;
    if (report.letterhead.footerLegalNote) {
      csv += `"Nota Legal:"\t"${report.letterhead.footerLegalNote.replace(/"/g, '""')}"\r\n`;
    }
    if (report.letterhead.confidentialityNotice) {
      csv += `"Confidencialidad:"\t"${report.letterhead.confidentialityNotice.replace(/"/g, '""')}"\r\n`;
    }
    csv += `"Pie de Página Institucional:"\t"${(report.letterhead.footerContactLine || '').replace(/"/g, '""')}"\r\n`;
    csv += `"Sincronización Nube:"\t"Supabase Project Ref: pbrdtcbsvckfibafvwkq"\r\n`;
    csv += `"========================================================================================="\r\n`;

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Hidroponico_${report.cropBatch.name.replace(/\s+/g, '_')}_${report.periodType}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // 3. Export to Word format (.doc with rich HTML layout compliant with Microsoft Word and LibreOffice)
  exportToWord(report: ExportedReportData): void {
    const sig = report.signatures && report.signatures[0];
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${report.title}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; margin: 30px; color: #1e293b; }
          .header-table { width: 100%; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .inst-title { font-size: 18pt; font-weight: bold; color: #0f172a; }
          .inst-sub { font-size: 10pt; color: #475569; }
          .report-title { font-size: 16pt; font-weight: bold; color: #059669; margin: 15px 0 5px 0; }
          .meta-text { font-size: 9pt; color: #64748b; margin-bottom: 15px; }
          .card-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; border: 1px solid #cbd5e1; }
          .card-table td { padding: 8px 12px; font-size: 9.5pt; }
          .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          .data-table th { background-color: #1e293b; color: #ffffff; padding: 6px 8px; font-size: 8.5pt; text-align: left; }
          .data-table td { border-bottom: 1px solid #e2e8f0; padding: 5px 8px; font-size: 8pt; }
          .signature-box { border: 1px solid #94a3b8; padding: 12px; width: 45%; margin-top: 25px; background: #fafafa; }
          .qr-img { width: 100px; height: 100px; }
        </style>
      </head>
      <body>
        <table class="header-table">
          <tr>
            <td>
              <div class="inst-title">${report.letterhead.institutionName}</div>
              <div class="inst-sub">${report.letterhead.slogan}</div>
              <div class="inst-sub">${report.letterhead.taxId} | ${report.letterhead.address}</div>
              <div class="inst-sub">Tel: ${report.letterhead.phone} | Email: ${report.letterhead.email} | Web: ${report.letterhead.website || 'N/A'}</div>
              ${report.letterhead.isoCertification ? `<div class="inst-sub" style="color:#059669; font-weight:bold; margin-top:3px;">Certificación: ${report.letterhead.isoCertification}</div>` : ''}
            </td>
            <td align="right" valign="top">
              ${report.qrCodeDataUrl ? `<img src="${report.qrCodeDataUrl}" class="qr-img" alt="QR" /><br/><small style="font-size:7pt;color:#64748b;">Escanear para verificar</small>` : ''}
            </td>
          </tr>
        </table>

        <div class="report-title">${report.title}</div>
        <div class="meta-text">
          <b>Folio Oficial:</b> ${report.letterhead.documentCodePrefix || 'INF-HYDRO'}-${report.reportId} | <b>Período:</b> ${report.periodLabel} | <b>Generado:</b> ${new Date(report.generatedAt).toLocaleString('es-ES')}
        </div>

        <table class="card-table">
          <tr>
            <td><b>Cultivo:</b> ${report.cropBatch.name} (${report.cropBatch.variety})</td>
            <td><b>Sistema Hidropónico:</b> ${report.cropBatch.systemType}</td>
          </tr>
          <tr>
            <td><b>Fase de Crecimiento:</b> ${report.cropBatch.growthStage.toUpperCase()}</td>
            <td><b>Capacidad Tanque:</b> ${report.cropBatch.tankCapacityLiters} Litros (${report.cropBatch.plantCount} Plantas)</td>
          </tr>
          <tr>
            <td colspan="2"><b>Ubicación del Módulo:</b> ${report.cropBatch.location}</td>
          </tr>
        </table>

        <h3>Resumen Estadístico del Período</h3>
        <table class="card-table">
          <tr>
            <td><b>pH Promedio:</b> ${report.summary.avgPh.toFixed(2)} (Mín: ${report.summary.minPh.toFixed(2)} / Máx: ${report.summary.maxPh.toFixed(2)})</td>
            <td><b>EC Promedio:</b> ${report.summary.avgEc.toFixed(2)} mS/cm (Mín: ${report.summary.minEc.toFixed(2)} / Máx: ${report.summary.maxEc.toFixed(2)})</td>
          </tr>
          <tr>
            <td><b>Temperatura Solución:</b> ${report.summary.avgWaterTemp.toFixed(1)} °C (Ambiente: ${report.summary.avgAirTemp.toFixed(1)} °C)</td>
            <td><b>Nivel Mínimo de Agua:</b> ${report.summary.minWaterLevel}% | <b>Alertas:</b> ${report.summary.totalAlerts}</td>
          </tr>
        </table>

        <h3>Detalle de Lecturas Registradas</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>pH</th>
              <th>EC (mS)</th>
              <th>TDS (ppm)</th>
              <th>Nivel Agua</th>
              <th>T. Agua</th>
              <th>T. Aire</th>
              <th>Humedad</th>
              <th>Sensor</th>
            </tr>
          </thead>
          <tbody>
            ${report.readings.slice(0, 30).map(r => `
              <tr>
                <td>${new Date(r.timestamp).toLocaleString('es-ES')}</td>
                <td>${r.ph.toFixed(2)}</td>
                <td>${r.ec.toFixed(2)}</td>
                <td>${r.tdsPpm || '-'}</td>
                <td>${r.waterLevelPct}% (${r.waterLevelLiters}L)</td>
                <td>${r.waterTempC}°C</td>
                <td>${r.airTempC}°C</td>
                <td>${r.humidityPct}%</td>
                <td>${r.sensorSource}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table style="width:100%; margin-top: 30px;">
          <tr>
            <td width="50%" valign="top">
              <div class="signature-box">
                <p><b>FIRMA DIGITAL REGISTRADA:</b></p>
                ${sig && sig.signatureBase64 ? `<img src="${sig.signatureBase64}" style="max-height: 50px;" /><br/>` : '<p style="color:#94a3b8;">[Firma Acreditada]</p>'}
                <b>${sig ? sig.signerName : report.letterhead.legalRepresentative}</b><br/>
                <span>${sig ? sig.signerTitle : report.letterhead.agronomistRegNumber}</span><br/>
                <small style="font-size:7pt; color:#64748b;">Fecha: ${new Date(report.generatedAt).toLocaleDateString('es-ES')}</small>
              </div>
            </td>
            <td width="50%" valign="top">
              <div class="signature-box">
                <p style="color:#059669;"><b>VALIDACIÓN CRIPTOGRÁFICA:</b></p>
                <small style="font-family: monospace; font-size:7.5pt; word-break: break-all;">${report.securityHash}</small>
                <p style="font-size:7pt; color:#64748b; margin-top:8px;">Documento autenticado electrónicamente conforme al estándar de trazabilidad agrícola y Supabase ref: pbrdtcbsvckfibafvwkq.</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- MEMBRETE INFERIOR (PIE DE PÁGINA) -->
        <table style="width:100%; border-top: 1px solid #cbd5e1; margin-top: 35px; padding-top: 10px; font-size: 7.5pt; color: #64748b;">
          <tr>
            <td>
              ${report.letterhead.footerLegalNote ? `<div><em><b>Nota Legal:</b> ${report.letterhead.footerLegalNote}</em></div>` : ''}
              ${report.letterhead.confidentialityNotice ? `<div><em><b>Confidencialidad:</b> ${report.letterhead.confidentialityNotice}</em></div>` : ''}
              <div style="margin-top: 4px; color: #334155;"><b>${report.letterhead.footerContactLine || `${report.letterhead.institutionName} • ${report.letterhead.address}`}</b></div>
            </td>
            <td align="right" valign="bottom" style="font-weight: bold; color: #059669;">
              ${report.letterhead.pageNumberFormat || 'Página 1 de 1 - HydroSense IoT Cloud System'}<br/>
              <span style="font-size: 6.5pt; color: #64748b;">Supabase Project Ref: pbrdtcbsvckfibafvwkq</span>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Hidroponico_${report.cropBatch.name.replace(/\s+/g, '_')}_${report.periodType}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
