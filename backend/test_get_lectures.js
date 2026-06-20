async function run() {
  const loginUrl = 'http://localhost:5000/api/auth/login';
  const lecturesUrl = 'http://localhost:5000/api/lectures';

  try {
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@lms.edu', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    const res = await fetch(lecturesUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err.message);
  }
}
run();
