// Generates database/seed.sql (run once by the developer; output is committed)
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const h = (p) => bcrypt.hashSync(p, 10);
const q = (v) => v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
let rnd = 42; const r = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
const out = [];
out.push('-- Medi_vault seed data. Run after schema.sql:  mysql -u root -p medi_vault < database/seed.sql');
out.push('-- Logins: admin/admin123 · owners (cityhealth, lifecare, wellness)/owner123, pending approval (greenleaf, medplus)/owner123 · customers (nimal, kasuni, ruwan)/user123');
out.push('SET NAMES utf8mb4;');
out.push('USE medi_vault;');
const A = h('admin123'), O = h('owner123'), U = h('user123');
const users = [
  [1,'admin','admin','admin@medivault.lk',A,'System Admin','0771234567',null,null,null,'approved'],
  [2,'owner','cityhealth','sunil@cityhealth.lk',O,'Sunil Perera','0712345678','1980-04-12','198010304567','12 Galle Rd, Colombo 03','approved'],
  [3,'owner','lifecare','dilani@lifecare.lk',O,'Dilani Fernando','0723456789','1985-09-22','198526604321','45 Peradeniya Rd, Kandy','approved'],
  [4,'owner','wellness','ashan@wellness.lk',O,'Ashan Jayasuriya','0754567890','1990-01-05','199000505678','8 Main St, Negombo','approved'],
  [5,'owner','greenleaf','tharindu@greenleaf.lk',O,'Tharindu Silva','0765678901','1992-07-18','199219908765','22 Temple Rd, Galle','pending'],
  [6,'owner','medplus','ishara@medplus.lk',O,'Ishara Gunawardena','0776789012','1988-11-30','198833501234','3 Lake Rd, Kurunegala','pending'],
  [7,'customer','nimal','nimal@gmail.com',U,'Nimal Rajapaksha','0701112233','1995-03-14','199507401111','77 Flower Rd, Colombo 07','approved'],
  [8,'customer','kasuni','kasuni@gmail.com',U,'Kasuni Wickramasinghe','0712223344','1998-06-02','199815402222','5 Hill St, Kandy','approved'],
  [9,'customer','ruwan','ruwan@gmail.com',U,'Ruwan Bandara','0723334455','1987-12-20','198735503333','19 Beach Rd, Negombo','approved'],
];
out.push('INSERT INTO users (id,role,username,email,password_hash,full_name,phone,birthday,id_no,address,status) VALUES');
out.push(users.map(u => '(' + u.map(q).join(',') + ')').join(',\n') + ';');
const ph = [
  [1,2,'City Health Pharmacy','PH-COL-2019-0456','12 Galle Rd, Colombo 03','Colombo','0112345678','info@cityhealth.lk','Trusted neighbourhood pharmacy with qualified pharmacists and fast delivery around Colombo.','Mon–Sun 8:00 AM – 10:00 PM',1,'Bank of Ceylon','8001234567','Sunil Perera'],
  [2,3,'LifeCare Pharmacy','PH-KAN-2020-0912','45 Peradeniya Rd, Kandy','Kandy','0812233445','hello@lifecare.lk','Your partner in health in the hill capital. Wide range of prescription and wellness products.','Mon–Sat 8:30 AM – 9:00 PM',1,'Commercial Bank','1002345678','Dilani Fernando'],
  [3,4,'Wellness Plus','PH-NEG-2021-0133','8 Main St, Negombo','Negombo','0312244556','care@wellnessplus.lk','Vitamins, baby care and everyday medicines at fair prices.','Mon–Sun 9:00 AM – 8:00 PM',0,'Sampath Bank','0103456789','Ashan Jayasuriya'],
  [4,5,'Green Leaf Pharmacy','PH-GAL-2024-0777','22 Temple Rd, Galle','Galle','0912255667','greenleaf@gmail.com',null,'Mon–Sat 8:00 AM – 8:00 PM',1,'HNB','2004567890','Tharindu Silva'],
  [5,6,'MedPlus Kurunegala','PH-KUR-2024-0321','3 Lake Rd, Kurunegala','Kurunegala','0372266778','medplus@gmail.com',null,'Mon–Sun 8:00 AM – 9:00 PM',1,'People\'s Bank','3005678901','Ishara Gunawardena'],
];
out.push('INSERT INTO pharmacies (id,owner_id,name,license_no,address,city,phone,email,description,opening_hours,is_open,bank_name,bank_account_no,bank_account_name) VALUES');
out.push(ph.map(p => '(' + p.map(q).join(',') + ')').join(',\n') + ';');
const catalog = [
  ['Panadol','Paracetamol 500mg','Pain Relief','GSK','500 mg tablet','Fast, effective relief from headache, fever and body pain. Gentle on the stomach.',12,0],
  ['Amoxil','Amoxicillin 250mg','Antibiotics','GSK','250 mg capsule','Broad-spectrum penicillin antibiotic used for bacterial infections. Prescription required.',35,1],
  ['Piriton','Chlorphenamine 4mg','Allergy','GSK','4 mg tablet','Relieves hay fever, itching, hives and other allergy symptoms.',8,0],
  ['Vitamin C 1000','Ascorbic Acid','Vitamins','Nature\'s Bounty','1000 mg tablet','Supports the immune system and healthy skin. One tablet daily.',45,0],
  ['Glucophage','Metformin 500mg','Diabetes','Merck','500 mg tablet','Helps control blood sugar in type 2 diabetes. Prescription required.',18,1],
  ['Losartan','Losartan Potassium 50mg','Heart & BP','Cipla','50 mg tablet','Lowers high blood pressure and protects the kidneys in diabetes.',22,1],
  ['Gaviscon','Sodium alginate','Digestive','Reckitt','200 ml liquid','Soothing relief from heartburn and indigestion.',980,0],
  ['Strepsils','Amylmetacresol','Cold & Flu','Reckitt','24 lozenges','Soothes sore throats and keeps your mouth fresh.',540,0],
  ['Cetirizine','Cetirizine 10mg','Allergy','Cipla','10 mg tablet','Non-drowsy 24-hour allergy relief.',10,0],
  ['Omeprazole','Omeprazole 20mg','Digestive','Dr. Reddy\'s','20 mg capsule','Reduces stomach acid for ulcers and acid reflux.',25,0],
  ['Calcium + D3','Calcium carbonate','Vitamins','Centrum','600 mg tablet','Supports strong bones and teeth.',38,0],
  ['Ibuprofen','Ibuprofen 400mg','Pain Relief','Abbott','400 mg tablet','Anti-inflammatory pain relief for muscle aches and joint pain.',15,0],
  ['Atorvastatin','Atorvastatin 20mg','Heart & BP','Pfizer','20 mg tablet','Lowers cholesterol to reduce heart disease risk.',30,1],
  ['Dettol Antiseptic','Chloroxylenol','First Aid','Reckitt','250 ml liquid','Protects cuts and grazes from infection.',690,0],
  ['Baby Gripe Water','Dill oil','Baby Care','Woodward\'s','150 ml liquid','Gentle relief from colic and wind in babies.',450,0],
  ['ORS Sachet','Oral rehydration salts','Digestive','Jeevani','1 sachet','Restores fluids and salts lost through diarrhoea or heat.',40,0],
];
const med = []; let mid = 1;
const stockFor = { 1: catalog.map((_, i) => i), 2: [0,1,2,3,4,5,6,8,9,10,11,12], 3: [0,2,3,6,7,9,10,13,14,15], 4: [0,3,7,11,14], 5: [0,1,4,5] };
for (const [pid, idxs] of Object.entries(stockFor)) {
  for (const i of idxs) {
    const c = catalog[i];
    const priceAdj = Math.round(c[6] * (0.9 + r() * 0.25) * 100) / 100;
    const stock = i % 7 === 3 && pid === '1' ? 4 : i === 5 && pid === '2' ? 0 : Math.floor(15 + r() * 150);
    med.push([mid++, +pid, c[0], c[1], c[2], c[3], c[4], c[5], priceAdj, stock, 10, c[7]]);
  }
}
out.push('INSERT INTO medicines (id,pharmacy_id,name,generic_name,category,manufacturer,dosage,description,price,stock_qty,low_stock_threshold,requires_prescription) VALUES');
out.push(med.map(m => '(' + m.map(q).join(',') + ')').join(',\n') + ';');
// orders over the last 45 days for approved pharmacies 1-3
const pays = ['cash_on_delivery','card','bank_transfer'];
const statuses = ['completed','completed','completed','completed','confirmed','ready','pending','cancelled'];
const orders = [], items = []; let oid = 1, iid = 1;
for (let n = 0; n < 70; n++) {
  const pid = 1 + Math.floor(r() * 3);
  const cust = 7 + Math.floor(r() * 3);
  const daysAgo = Math.floor(r() * 45);
  const st = daysAgo < 2 ? ['pending','confirmed','ready'][Math.floor(r()*3)] : statuses[Math.floor(r() * statuses.length)];
  const pm = pays[Math.floor(r() * 3)];
  const pmeds = med.filter(m => m[1] === pid);
  const count = 1 + Math.floor(r() * 3); let total = 0; const used = new Set();
  for (let k = 0; k < count; k++) {
    const m = pmeds[Math.floor(r() * pmeds.length)]; if (used.has(m[0])) continue; used.add(m[0]);
    const qty = m[8] > 300 ? 1 + Math.floor(r() * 2) : 5 + Math.floor(r() * 26);
    total += qty * m[8];
    items.push([iid++, oid, m[0], m[2], m[8], qty]);
  }
  const addr = users[cust - 1][9];
  orders.push(`(${oid},${cust},${pid},${total.toFixed(2)},'${st}','${pm}','${st === 'completed' || pm === 'card' ? 'paid' : 'unpaid'}',${q(addr)},${q(users[cust-1][6])},NULL,DATE_SUB(NOW(), INTERVAL ${daysAgo * 24 + Math.floor(r()*12)} HOUR))`);
  oid++;
}
out.push('INSERT INTO orders (id,customer_id,pharmacy_id,total,status,payment_method,payment_status,delivery_address,contact_phone,note,created_at) VALUES');
out.push(orders.join(',\n') + ';');
out.push('INSERT INTO order_items (id,order_id,medicine_id,medicine_name,unit_price,quantity) VALUES');
out.push(items.map(i => '(' + i.map(q).join(',') + ')').join(',\n') + ';');
const fb = [
  [7,1,1,5,'Quick delivery and genuine products. Highly recommended!'],
  [8,2,null,4,'Friendly pharmacist who explained the dosage clearly.'],
  [9,3,null,3,'Good prices but the shop was closed when I visited on Sunday.'],
  [8,1,4,5,'Vitamin C arrived the same day. Great service.'],
  [9,1,null,4,'Easy to order, would be great to have more payment options.'],
  [7,2,null,5,'Always has stock of my BP medicine.'],
];
out.push('INSERT INTO feedback (user_id,pharmacy_id,medicine_id,rating,comment,created_at) VALUES');
out.push(fb.map((f, i) => '(' + f.map(q).join(',') + `,DATE_SUB(NOW(), INTERVAL ${i * 3 + 1} DAY))`).join(',\n') + ';');
out.push(`INSERT INTO notifications (user_id,type,message,link) VALUES
(2,'order','New order #${oid - 1} received','/owner/orders'),
(2,'stock','Vitamin C 1000 is running low (4 left)','/owner/inventory'),
(2,'feedback','Ruwan Bandara left a 4★ review','/owner/feedback'),
(1,'account','2 pharmacy owners are waiting for approval','/admin/approvals');`);
fs.writeFileSync(path.join(__dirname, '..', '..', 'database', 'seed.sql'), out.join('\n') + '\n');
console.log('seed.sql written', med.length, 'medicines', orders.length, 'orders');
