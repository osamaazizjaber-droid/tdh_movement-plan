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

    // 4. Group drivers by car_type (preserving insertion order from Drivers tab)
    // Each unique car_type becomes one "column" in the template (driver 1 / driver 2)
    const carTypeMap = new Map(); // carType => [driver, ...]
    for (const driver of drivers) {
      const key = (driver.car_type || "غير محدد").trim();
      if (!carTypeMap.has(key)) carTypeMap.set(key, []);
      carTypeMap.get(key).push(driver);
    }

    const carTypeEntries = [...carTypeMap.entries()]; // [[carType, [drivers]], ...]

    // Column 1 = first car type group, Column 2 = second car type group
    const group1 = carTypeEntries[0] || ["السيارة 1", []];
    const group2 = carTypeEntries[1] || ["السيارة 2", []];

    const carType1     = group1[0];
    const carType2     = group2[0];
    const driverIds1   = group1[1].map(d => d.id);
    const driverIds2   = group2[1].map(d => d.id);
    // Build human-readable label: "Car Type – Driver Name(s)"
    const driverLabel1 = group1[1].map(d => d.name).join(' / ') || carType1;
    const driverLabel2 = group2[1].map(d => d.name).join(' / ') || carType2;

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

      // Morning row — grouped by car type
      const mG1 = getCarTypePlans(morningPlans, driverIds1, dateStr);
      const mG2 = getCarTypePlans(morningPlans, driverIds2, dateStr);
      morning_rows.push({
        day: dayAr, date: dateStr,
        d1_dest: mG1.dest, d1_pax: mG1.pax, d1_purp: mG1.purp,
        d2_dest: mG2.dest, d2_pax: mG2.pax, d2_purp: mG2.purp,
      });

      // Evening row — grouped by car type
      const eG1 = getCarTypePlans(eveningPlans, driverIds1, dateStr);
      const eG2 = getCarTypePlans(eveningPlans, driverIds2, dateStr);
      evening_rows.push({
        day: dayAr, date: dateStr,
        d1_dest: eG1.dest, d1_pax: eG1.pax, d1_purp: eG1.purp,
        d2_dest: eG2.dest, d2_pax: eG2.pax, d2_purp: eG2.purp,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 6. Inject into template
    // driver_1_name / driver_2_name = "Car Type – Driver Name(s)"
    doc.render({
      driver_1_name: `${carType1} – ${driverLabel1}`,
      driver_2_name: `${carType2} – ${driverLabel2}`,
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
