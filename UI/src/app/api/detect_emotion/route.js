import fetch from 'node-fetch';

export async function POST(req) {
  try {
    // Get the request body from Next.js frontend
    const data = await req.json();

    // Send the data to the Python backend for emotion detection
    const response = await fetch('http://localhost:8000/detect_emotion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const emotionData = await response.json();

    // Return the emotion data from Python to the Next.js frontend
    return new Response(JSON.stringify(emotionData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error detecting emotion' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
