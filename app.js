let db;
function initDatabase(){

const request =
indexedDB.open(
"NangodiHealthDB",
1
);

request.onupgradeneeded =
function(event){

db = event.target.result;

if(
!db.objectStoreNames.contains(
"patients"
)
){

db.createObjectStore(
"patients",
{
keyPath:"id"
}
);

}

};

request.onsuccess =
function(event){

db = event.target.result;

loadPatients();

};

}

/****************************************
 NANGODI HEALTH CENTRE DIGITAL RECORDS
 VERSION 1 CORE SYSTEM
 UDS TTFPP GROUP 149
****************************************/


/* ====================================
   USERS
==================================== */

const users = [

{
username:"admin",
password:"admin123",
role:"Administrator",
name:"System Administrator"
},

{
username:"nurse1",
password:"nurse123",
role:"Nurse",
name:"Staff Nurse"
},

{
username:"pharmacist1",
password:"pharm123",
role:"Pharmacist",
name:"Pharmacist"
},

{
username:"cho1",
password:"cho123",
role:"Community Health Officer",
name:"CHO"
}

];


/* ====================================
   GLOBAL VARIABLES
==================================== */

let currentUser = null;

let patients =
JSON.parse(localStorage.getItem("patients")) || [];

let editingId = null;


/* ====================================
   PAGE LOAD
==================================== */

window.onload = () => {

initDatabase();

checkSession();

bindNavigation();

bindLogin();

bindPatientForm();

bindSearch();

};

/* ====================================
   LOGIN
==================================== */

function bindLogin(){

const form = document.getElementById("loginForm");

form.addEventListener("submit", function(e){

e.preventDefault();

const username =
document.getElementById("username").value.trim();

const password =
document.getElementById("password").value.trim();

const user = users.find(u =>
u.username === username &&
u.password === password
);

if(!user){

alert("Invalid Username or Password");

return;

}

currentUser = user;

localStorage.setItem(
"sessionUser",
JSON.stringify(user)
);

showApp();

});

}


/* ====================================
   SESSION
==================================== */

function checkSession(){

const savedUser =
JSON.parse(localStorage.getItem("sessionUser"));

if(savedUser){

currentUser = savedUser;

showApp();

}

}


function showApp(){

document.getElementById("loginScreen")
.style.display = "none";

document.getElementById("appContainer")
.style.display = "flex";

document.getElementById("userInfo")
.textContent =
`${currentUser.name} (${currentUser.role})`;

applyRoleRestrictions();

renderPatients();

updateDashboard();

}


/* ====================================
   LOGOUT
==================================== */

document.addEventListener("click", function(e){

if(e.target.id === "logoutBtn"){

localStorage.removeItem("sessionUser");

location.reload();

}

});


/* ====================================
   NAVIGATION
==================================== */

function bindNavigation(){

const menuItems =
document.querySelectorAll(".menu-item");

menuItems.forEach(item => {

item.addEventListener("click", function(){

menuItems.forEach(i =>
i.classList.remove("active")
);

this.classList.add("active");

const page =
this.dataset.page;

document
.querySelectorAll(".page")
.forEach(section => {

section.classList.remove(
"active-page"
);

});

document
.getElementById(page)
.classList.add("active-page");

document
.getElementById("pageTitle")
.textContent =
this.textContent;

});

});

}


/* ====================================
   ROLE MANAGEMENT
==================================== */

function applyRoleRestrictions(){

if(!currentUser) return;

if(currentUser.role === "Pharmacist"){

hideMenu("patients");
hideMenu("consultation");
hideMenu("anc");

}

if(currentUser.role ===
"Community Health Officer"){

hideMenu("patients");
hideMenu("consultation");
hideMenu("anc");
hideMenu("pharmacy");

}

}


function hideMenu(page){

const menu =
document.querySelector(
`[data-page="${page}"]`
);

if(menu){

menu.style.display = "none";

}

}


/* ====================================
   PATIENT FORM
==================================== */

function bindPatientForm(){

const form =
document.getElementById("patientForm");

form.addEventListener("submit", function(e){

e.preventDefault();

savePatient();

});

}


/* ====================================
   SAVE PATIENT
==================================== */

function savePatient(){

const fullName =
document.getElementById("fullName").value;

const age =
document.getElementById("age").value;

const sex =
document.getElementById("sex").value;

const phone =
document.getElementById("phone").value;

const community =
document.getElementById("community").value;

const nhis =
document.getElementById("nhis").value;

const nextOfKin =
document.getElementById("nextOfKin").value;

if(fullName === ""){

alert("Patient Name Required");

return;

}

if(editingId){

const patient =
patients.find(
p => p.id === editingId
);

patient.fullName = fullName;
patient.age = age;
patient.sex = sex;
patient.phone = phone;
patient.community = community;
patient.nhis = nhis;
patient.nextOfKin = nextOfKin;

patient.modifiedBy =
currentUser.username;

patient.modifiedDate =
new Date().toLocaleString();

editingId = null;

}else{

const patient = {

id: Date.now(),

patientId:
"NHC-" + Date.now(),

fullName,

age,

sex,

phone,

community,

nhis,

nextOfKin,

status:"Draft",

createdBy:
currentUser.username,

createdRole:
currentUser.role,

createdDate:
new Date().toLocaleString(),

modifiedBy:
currentUser.username,

modifiedDate:
new Date().toLocaleString()

};

patients.push(patient);

}

localStorage.setItem(
"patients",
JSON.stringify(patients)
);

document
.getElementById("patientForm")
.reset();

renderPatients();

updateDashboard();

alert("Record Saved");

}


/* ====================================
   RENDER PATIENTS
==================================== */

function renderPatients(){

const table =
document.getElementById("patientTable");

if(!table) return;

table.innerHTML = "";

patients.forEach(patient => {

table.innerHTML += `

<tr>

<td>${patient.fullName}</td>

<td>${patient.age}</td>

<td>${patient.sex}</td>

<td>${patient.status}</td>

<td>${patient.createdBy}</td>

<td>

<button
class="edit-btn"
onclick="editPatient(${patient.id})">

Edit

</button>

<button
class="delete-btn"
onclick="deletePatient(${patient.id})">

Delete

</button>

</td>

</tr>

`;

});

}


/* ====================================
   EDIT
==================================== */

function editPatient(id){

const patient =
patients.find(
p => p.id === id
);

if(!patient) return;

document
.getElementById("fullName")
.value = patient.fullName;

document
.getElementById("age")
.value = patient.age;

document
.getElementById("sex")
.value = patient.sex;

document
.getElementById("phone")
.value = patient.phone;

document
.getElementById("community")
.value = patient.community;

document
.getElementById("nhis")
.value = patient.nhis;

document
.getElementById("nextOfKin")
.value = patient.nextOfKin;

editingId = id;

window.scrollTo({
top:0,
behavior:"smooth"
});

}


/* ====================================
   DELETE
==================================== */

function deletePatient(id){

if(!confirm(
"Delete this patient record?"
)){

return;

}

patients =
patients.filter(
p => p.id !== id
);

localStorage.setItem(
"patients",
JSON.stringify(patients)
);

renderPatients();

updateDashboard();

}


/* ====================================
   DASHBOARD
==================================== */

function updateDashboard(){

document.getElementById(
"totalPatients"
).textContent =
patients.length;

document.getElementById(
"draftCount"
).textContent =
patients.filter(
p => p.status === "Draft"
).length;

document.getElementById(
"readyCount"
).textContent =
patients.filter(
p => p.status === "Ready"
).length;

document.getElementById(
"syncedCount"
).textContent =
patients.filter(
p => p.status === "Synced"
).length;

document.getElementById(
"failedCount"
).textContent =
patients.filter(
p => p.status === "Failed"
).length;

}


/* ====================================
   PWA REGISTRATION
==================================== */

if("serviceWorker" in navigator){

window.addEventListener("load",()=>{

navigator.serviceWorker.register(
"service-worker.js"
);

});

}