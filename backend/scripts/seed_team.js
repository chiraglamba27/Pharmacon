import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../backend/.env') });

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const team = [
    {
      name: 'Aryan Sharma',
      role: 'AI Pipeline Lead',
      technical_focus: 'The AI pipeline — turning a photographed handwritten prescription into structured data through fixed-form capture, doctor-adaptive recognition, and safe human-confirmed extraction.',
      responsibilities: 'Python, PyTorch/Transformers (fine-tuning), OpenCV (document perspective correction), OCR/HTR model evaluation (CER/WER).',
      display_order: 1
    },
    {
      name: 'Amitesh Kr. Singh',
      role: 'Deployment, Model Training',
      technical_focus: 'Supabase Deployment, Training model capable of Calibrating',
      responsibilities: 'Postgres, JavaScript, Computer Vision',
      display_order: 2
    },
    {
      name: 'Aniket Raj',
      role: 'Frontend Lead',
      technical_focus: 'UI/UX architecture, responsive design system,',
      responsibilities: 'React,Javascript,Tailwind CSS,Node js',
      display_order: 3
    },
    {
      name: 'Chirag Lamba',
      role: 'Frontend Assistance + Backend',
      technical_focus: 'Github Actions , Github Pages Deployment , Backend , Testing ',
      responsibilities: 'GitHub Actions, System Integration, Testing,',
      display_order: 4
    }
  ];

  for (const member of team) {
    const { data, error } = await supabaseAdmin.from('team_members').insert(member);
    if (error) {
      console.error('Error inserting', member.name, error);
    } else {
      console.log('Inserted', member.name);
    }
  }
}

run();
