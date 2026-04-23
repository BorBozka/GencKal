const targetCalories = 2000;
const dietType = "standart";
const mealsPerDay = 3;

async function test() {
    try {
        const res = await fetch("http://localhost:3000/api/generate-diet", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                targetCalories,
                dietType,
                mealsPerDay
            })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response text:");
        console.log(text);
    } catch(err) {
        console.error(err);
    }
}
test();
