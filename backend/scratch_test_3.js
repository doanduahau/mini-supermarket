async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager1@supermarket.com', password: 'Manager@123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.accessToken;

    const res = await fetch('http://localhost:5000/api/shift-assignments/6a1bc3cc2422aca047f8af74/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ status: 'rejected' })
    });
    const data = await res.json();
    console.log(res.status);
    console.log(data);
  } catch(e) {
    console.log(e);
  }
}
test();
