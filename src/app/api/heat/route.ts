import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'heat.json');

interface HeatData {
  date: string;
  count: number;
}

function getHeatData(): HeatData {
  const today = new Date().toISOString().split('T')[0];
  let data: HeatData = { date: today, count: 0 };

  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(fileContent);
      if (parsed.date === today) {
        data = parsed;
      } else {
        // Reset for new day, keeping the date as today
        data = { date: today, count: 0 };
        // Optionally preserve old data, but requirement is "today's visits"
      }
    } catch (e) {
      console.error("Error reading heat data:", e);
    }
  }
  return data;
}

function saveHeatData(data: HeatData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error writing heat data:", e);
  }
}

export async function GET() {
  const data = getHeatData();
  return NextResponse.json({ count: data.count });
}

export async function POST() {
  const data = getHeatData();
  data.count += 1;
  saveHeatData(data);
  return NextResponse.json({ count: data.count });
}
