const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const services = [
  {
    id: 1,
    name: 'Al Amal Hospital',
    category: 'Hospitals',
    type: 'Hospital',
    address: 'Riyadh, Saudi Arabia',
    phone: '+966 11 000 0000',
    description: 'General healthcare and disability support services.',
    accessibility: 'Accessible entrances, hearing loop, wheelchair access',
    verified: true,
    location: { lat: 24.7136, lng: 46.6753 }
  },
  {
    id: 2,
    name: 'King Saud University',
    category: 'Universities',
    type: 'Education',
    address: 'Riyadh, Saudi Arabia',
    phone: '+966 11 467 0000',
    description: 'Inclusive campus resources and adaptive learning support.',
    accessibility: 'Accessible routes, assistive tech, support services',
    verified: true,
    location: { lat: 24.7256, lng: 46.6234 }
  },
  {
    id: 3,
    name: 'Sama Rehabilitation Center',
    category: 'Rehabilitation and Physiotherapy',
    type: 'Care',
    address: 'Jeddah, Saudi Arabia',
    phone: '+966 12 555 1111',
    description: 'Physiotherapy, rehabilitation, and mobility support.',
    accessibility: 'Accessible treatment rooms and adapted equipment',
    verified: false,
    location: { lat: 21.5433, lng: 39.1728 }
  },
  {
    id: 4,
    name: 'Noura Library',
    category: 'Libraries',
    type: 'Learning',
    address: 'Dammam, Saudi Arabia',
    phone: '+966 13 222 4444',
    description: 'Public reading spaces and digital access support.',
    accessibility: 'Screen reader support and reading assistance',
    verified: true,
    location: { lat: 26.4207, lng: 50.0888 }
  },
  {
    id: 5,
    name: 'Beit Al Quds Café',
    category: 'Restaurants and cafes',
    type: 'Hospitality',
    address: 'Makkah, Saudi Arabia',
    phone: '+966 12 666 7777',
    description: 'Accessible dining and seating for inclusive visits.',
    accessibility: 'Accessible seating and quiet corner available',
    verified: false,
    location: { lat: 21.3891, lng: 39.8579 }
  }
];

const impactStats = {
  users: 12840,
  listedServices: 96,
  verifiedLocations: 41,
  communityContributions: 2140,
  educationalResources: 122,
  engagement: 8940
};

const appointmentRequests = [];
const emergencyProfiles = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Qaderoon', version: '1.0.0' });
});

app.get('/api/services', (req, res) => {
  res.json(services);
});

app.get('/api/impact', (req, res) => {
  res.json(impactStats);
});

app.get('/api/appointments', (req, res) => {
  res.json(appointmentRequests);
});

app.get('/api/emergency-profiles', (req, res) => {
  res.json(emergencyProfiles);
});

app.post('/api/ai', (req, res) => {
  const { question } = req.body || {};
  const apiKeyPresent = Boolean(process.env.OPENAI_API_KEY);

  if (!apiKeyPresent) {
    return res.json({
      connected: false,
      reply:
        'Qaderoon AI is not fully connected yet. A secure external AI service is required before live intelligent responses can be enabled. You can still explore the platform and use the available accessibility tools.'
    });
  }

  const formattedQuestion = (question || '').trim();
  if (!formattedQuestion) {
    return res.status(400).json({ message: 'Please enter a question to continue.' });
  }

  res.json({
    connected: true,
    reply: `This is a secure AI response sample for: "${formattedQuestion}". The assistant can guide users to relevant Qaderoon sections once the external AI service is configured and validated.`
  });
});

app.post('/api/appointments', (req, res) => {
  const { fullName, specialist, preferredDate, message, saveDraft } = req.body || {};

  if (!fullName || !specialist || !preferredDate) {
    return res.status(400).json({
      message: 'Please fill in your name, specialist, and preferred date.'
    });
  }

  const payload = {
    id: Date.now(),
    fullName,
    specialist,
    preferredDate,
    message: message || '',
    saveDraft: Boolean(saveDraft),
    createdAt: new Date().toISOString()
  };

  if (saveDraft) {
    appointmentRequests.push(payload);
    return res.json({
      status: 'draft',
      message: 'Appointment request saved as a draft. It has not been confirmed by the healthcare provider.',
      id: payload.id
    });
  }

  appointmentRequests.push(payload);

  res.json({
    status: 'submitted',
    message: 'Appointment request submitted. Please wait for provider confirmation before treating it as confirmed.',
    id: payload.id
  });
});

app.post('/api/emergency-profile', (req, res) => {
  const { name, medicalNotes, contact, shareLocation } = req.body || {};

  if (!name || !contact) {
    return res.status(400).json({
      message: 'Please provide a name and a trusted contact.'
    });
  }

  const profile = {
    id: Date.now(),
    name,
    medicalNotes: medicalNotes || '',
    contact,
    shareLocation: Boolean(shareLocation),
    createdAt: new Date().toISOString()
  };

  emergencyProfiles.push(profile);

  res.json({
    status: 'saved',
    message: 'Emergency profile saved locally and ready for trusted support use.',
    profile
  });
});

app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Qaderoon server running on http://localhost:${PORT}`);
});
