async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/events');
        const data = await res.json();
        console.log('API Response:', data);
    } catch (error) {
        console.error('API Error:', error);
    }
}

testApi();
