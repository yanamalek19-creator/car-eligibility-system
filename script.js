let cars = [];
let currentVariant = null;

const familySelect = document.getElementById("family");
const variantSelect = document.getElementById("variant");


fetch("data/cars.json")
.then(response => response.json())
.then(data => {

    cars = data;

    loadFamily();

});


function loadFamily(){

    familySelect.innerHTML = `
        <option>Pilih Model</option>
    `;


    cars.forEach(car => {

        let option = document.createElement("option");

        option.value = car.family;
        option.textContent = car.family;

        familySelect.appendChild(option);

    });

}

familySelect.addEventListener("change", function(){

    let selectedFamily = this.value;

    variantSelect.innerHTML = `
        <option>Pilih Variant</option>
    `;


    let selectedCar = cars.find(car => car.family === selectedFamily);


    if(selectedCar){

        selectedCar.variants
        .filter(variant => variant.status === "Active")
        .forEach(variant => {

            let option = document.createElement("option");

            option.value = variant.name;
            option.textContent = variant.name;

            variantSelect.appendChild(option);

        });

    }

});

variantSelect.addEventListener("change", function(){

    let selectedVariant = this.value;
    let selectedFamily = familySelect.value;


    let selectedCar = cars.find(car => car.family === selectedFamily);


    if(selectedCar){

    let variantData = selectedCar.variants.find(
        variant => variant.name === selectedVariant
    );

    if(variantData){

        currentVariant = variantData;

        document.getElementById("whatsappBtn").disabled = false;

        document.getElementById("price").value =
        variantData.price;

        document.getElementById("interest").textContent =
        variantData.interest + "%";

        document.getElementById("tenure").value =
        variantData.loanYear;

        calculateLoan();
    

    }

}

});

function formatRM(value){

    return "RM " + Number(value).toLocaleString("en-MY", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}

function calculateLoan(){

    console.log("KIRA JALAN");

    let price = Number(document.getElementById("price").value) || 0;

    let downpayment = Number(document.getElementById("downpayment").value) || 0;

    let rebate = Number(document.getElementById("rebate").value) || 0;

    if(!currentVariant) return;

    let interest = currentVariant.interest;


    let tenure = Number(
        document.getElementById("tenure").value
    ) || 9;


    let loanAmount = price - downpayment - rebate;


    if(loanAmount < 0){
        loanAmount = 0;
    }


    let totalInterest = loanAmount * (interest / 100) * tenure;


    let totalLoan = loanAmount + totalInterest;


    let monthly = totalLoan / (tenure * 12);



    document.getElementById("loanAmount").textContent =
    formatRM(loanAmount);

    document.getElementById("monthly").textContent =
    formatRM(monthly);


    document.getElementById("downpayment")
   .addEventListener("input", calculateLoan);


    document.getElementById("rebate")
    .addEventListener("input", calculateLoan);


    document.getElementById("tenure")
    .addEventListener("change", calculateLoan);

}

const salaryInput = document.getElementById("salary");
const searchInput = document.getElementById("search");
const resultBox = document.getElementById("result");


salaryInput.addEventListener("input", checkEligibility);
searchInput.addEventListener("input", checkEligibility);



function checkEligibility(){

    console.log("CHECK JALAN");

    let salary = Number(salaryInput.value);

    let maxMonthly = null;


    if(salary){

    maxMonthly = salary * 0.30;

}


    let html = "";
    let keyword = searchInput.value.toLowerCase().trim();



cars.forEach(car => {

    car.variants
    .filter(variant => variant.status === "Active")
    .forEach(variant => {

        if(variant.price > 0){

            let loanAmount = variant.price;

            let interest = variant.interest;

            let year = variant.loanYear;

            let totalInterest =
            loanAmount * (interest / 100) * year;

            let monthly =
            (loanAmount + totalInterest)
            /
            (year * 12);


            if(
                (
                    maxMonthly === null ||
                    monthly <= maxMonthly
                )
                &&
                (
                    keyword === "" ||
                    car.family.toLowerCase().includes(keyword) ||
                    variant.name.toLowerCase().includes(keyword)
    )
){

            html += `
            <div class="car-result">

            <h3>
            🚗 ${car.family}
            </h3>

            <p>
            ${variant.name}
            </p>

            <p class="monthly">
            💰 RM${monthly.toFixed(0)} / bulan
            </p>


            <button onclick="selectCar('${car.family}','${variant.name}')">
            Pilih Kereta
            </button>

            </div>
            `;

            }

        }

    });

});

    if(html === ""){

    html = `
    <p>
    ❌ Tiada kereta dalam bajet ini.
    </p>
    `;

}

resultBox.innerHTML = html;

}

function selectCar(family, variant){

    console.log("SELECTCAR MASUK");
    console.log("FAMILY:", family);
    console.log("VARIANT:", variant);


    familySelect.value = family;

    familySelect.dispatchEvent(
        new Event("change")
    );


    setTimeout(() => {

        variantSelect.value = variant;

        variantSelect.dispatchEvent(
            new Event("change")
        );


    },500);

}

function sendWhatsApp(){

    let phone =
    document.getElementById("customerPhone").value;

    phone = formatPhone(phone);


    let model =
    familySelect.options[familySelect.selectedIndex].textContent;


    let variant =
    variantSelect.options[variantSelect.selectedIndex].textContent;


    let monthly =
    document.getElementById("monthly").textContent;


    let price =
    formatRM(document.getElementById("price").value);


    let downpayment =
    formatRM(
        document.getElementById("downpayment").value || 0
    );


    let rebate =
    formatRM(
        document.getElementById("rebate").value || 0
    );


    let tenure =
    document.getElementById("tenure").value;


    if(!phone){

        alert("Masukkan nombor WhatsApp customer");

        return;

    }


    let message = `Salam Tuan/Puan 😊

Seperti perbincangan tadi, saya sediakan anggaran quotation untuk Tuan/Puan:

🚗 Model:
${model}

🚘 Variant:
${variant}

💰 Harga OTR:
${price}

💳 Downpayment:
${downpayment}

🎁 Rebate:
${rebate}

📆 Tempoh:
${tenure} Tahun

💵 Anggaran Bulanan:
${monthly}

Saya boleh bantu semak kelayakan dan proses permohonan seterusnya.

Jika ada apa-apa pertanyaan boleh terus reply WhatsApp ini ya.

Terima kasih 😊

Ella
Sales Advisor Proton`;


    let whatsapp =
    "https://wa.me/"
    +
    phone
    +
    "?text="
    +
    encodeURIComponent(message);


    window.open(whatsapp, "_blank");

}

function formatPhone(phone){

    phone = phone.replace(/\D/g,"");


    if(phone.startsWith("0")){

        phone = "60" + phone.substring(1);

    }


    if(phone.startsWith("60")){

        return phone;

    }


    return phone;

}

function resetCustomer(){

    document.getElementById("salary").value = "";

    document.getElementById("search").value = "";

    document.getElementById("customerPhone").value = "";

    familySelect.value = "";

    variantSelect.innerHTML = `
    <option>Pilih Variant</option>
    `;


    document.getElementById("price").value = "";

    document.getElementById("interest").textContent = "-";

    document.getElementById("loanAmount").textContent = "RM0";

    document.getElementById("monthly").textContent = "RM0";


    document.getElementById("whatsappBtn").disabled = true;


    currentVariant = null;


    resultBox.innerHTML = `
    <p class="info">
    Masukkan gaji bersih untuk semak kelayakan.
    </p>
    `;


}