import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

// Helper to get formatted plans for a group of driver IDs on a specific date
const getCarTypePlans = (plans, driverIds, dateStr) => {
  const dayPlans = plans.filter(p => driverIds.includes(p.driver_id) && p.date === dateStr);
  if (dayPlans.length === 0) {
    return { dest: "-", pax: "-", purp: "-" };
  }
  return {
    dest: dayPlans.map(p => p.destination).filter(Boolean).join('\n') || "-",
    pax:  dayPlans.map(p => p.passengers).filter(Boolean).join('\n') || "-",
    purp: dayPlans.map(p => p.purpose).filter(Boolean).join('\n') || "-"
  };
};

export const generateMovementDocx = async (plans, drivers, title = "خطة حركة السيارات", startDateStr, endDateStr) => {
  try {
    // 1. Fetch the template from the public folder
    const response = await fetch("/template.docx");
    if (!response.ok) {
      throw new Error("لم يتم العثور على ملف template.docx في المجلد public. يرجى التأكد من إضافة القالب أولاً.");
    }
    const arrayBuffer = await response.arrayBuffer();

    // 2. Load the zip
    const zip = new PizZip(arrayBuffer);

    // 3. Create docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 4. Prepare Data
    // The template expects up to 2 drivers (d1 and d2).
    // The caller now passes a filtered list of drivers (e.g. only StarX drivers).
    const driver1 = drivers[0] || { id: "d1", name: "-" };
    const driver2 = drivers[1] || { id: "d2", name: "-" };

    // 5. Build date range
    let startD = startDateStr ? new Date(startDateStr) : new Date();
    let endD   = endDateStr   ? new Date(endDateStr)   : new Date();

    if (!startDateStr || !endDateStr || isNaN(startD.getTime()) || isNaN(endD.getTime())) {
      if (plans.length > 0) {
        const dates = plans.map(p => new Date(p.date).getTime());
        startD = new Date(Math.min(...dates));
      }
      const diff = startD.getDate() - startD.getDay();
      startD = new Date(startD.setDate(diff)); // nearest Sunday
      endD   = new Date(startD);
      endD.setDate(startD.getDate() + 4);      // Thursday
    }

    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const morning_rows = [];
    const evening_rows = [];

    const morningPlans = plans.filter(p => p.shift === 'Morning');
    const eveningPlans = plans.filter(p => p.shift === 'Evening');

    let currentDate = new Date(startD);
    while (currentDate <= endD) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayAr   = arabicDays[currentDate.getDay()];

      // Morning row
      const mD1 = getCarTypePlans(morningPlans, [driver1.id], dateStr);
      const mD2 = getCarTypePlans(morningPlans, [driver2.id], dateStr);
      morning_rows.push({
        day: dayAr, date: dateStr,
        d1_dest: mD1.dest, d1_pax: mD1.pax, d1_purp: mD1.purp,
        d2_dest: mD2.dest, d2_pax: mD2.pax, d2_purp: mD2.purp,
      });

      // Evening row
      const eD1 = getCarTypePlans(eveningPlans, [driver1.id], dateStr);
      const eD2 = getCarTypePlans(eveningPlans, [driver2.id], dateStr);
      evening_rows.push({
        day: dayAr, date: dateStr,
        d1_dest: eD1.dest, d1_pax: eD1.pax, d1_purp: eD1.purp,
        d2_dest: eD2.dest, d2_pax: eD2.pax, d2_purp: eD2.purp,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 6. Inject into template
    doc.render({
      driver_1_name: driver1.name,
      driver_2_name: driver2.name,
      morning_rows,
      evening_rows
    });

    // 7. Generate and download
    const out = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    saveAs(out, `${title}.docx`);

  } catch (err) {
    console.error("Error generating docx:", err);
    alert(err.message);
  }
};
