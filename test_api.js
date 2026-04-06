async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/locations/hospitals');
    const data = await res.json();
    console.log(JSON.stringify(data.hospitals[0], null, 2));
  } catch (err) {
    console.error(err);
  }
}
testApi();
