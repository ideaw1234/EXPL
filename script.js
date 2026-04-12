// ---------- UI & Navigation ----------
function showScreen(i){
  document.querySelectorAll('.screen').forEach((s,j)=>s.classList.toggle('active',i===j));
  document.querySelectorAll('.nav-btn').forEach((b,j)=>b.classList.toggle('active',i===j));
  if(i === 2) filterDashState('unchecked');
}

// 📌 [UPDATED] สลับแท็บใน Dashboard + lazy-init map เมื่อเปิด tab แผนที่ครั้งแรก
let mapInitialized = false;

function switchDash(i){
  document.querySelectorAll('.d-tab').forEach((t,j)=>t.classList.toggle('active',i===j));
  document.getElementById('d-view-0').classList.toggle('active',i===0);
  document.getElementById('d-view-1').classList.toggle('active',i===1);
  if(document.getElementById('d-view-2')){
    document.getElementById('d-view-2').classList.toggle('active',i===2);
  }
  if(i === 2){
    if(!mapInitialized){
      // init หลังจาก container แสดงแล้ว (setTimeout ให้ browser layout ก่อน)
      setTimeout(function(){ initMap(); mapInitialized = true; }, 80);
    } else {
      setTimeout(function(){ map.invalidateSize(); }, 50);
    }
  }
}

function showSubTab(i){
  document.querySelectorAll('.sub-tab').forEach((b,j)=>b.classList.toggle('active',i===j));
  document.getElementById('sub0').style.display=i===0?'block':'none';
  document.getElementById('sub1').style.display=i===1?'block':'none';
  showScreen(0);
}

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}

function closeAllModals(){
  document.querySelectorAll('.modal-bg').forEach(m => m.classList.remove('open'));
}

function toggleChip(el){el.classList.toggle('on');}
function toggleOther(el){
  el.classList.toggle('on');
  document.getElementById('other-input').classList.toggle('show',el.classList.contains('on'));
}

// 📌 [NEW] ฟังก์ชันสำหรับสลับโหมดในหน้าแผนที่
// 📌 [UPDATED] ฟังก์ชันสำหรับสลับโหมดในหน้าแผนที่จริง
function switchMapMode(mode) {
  if(!map) return; // ป้องกัน error ถ้า map ยังไม่ init
  document.getElementById('map-mode-pin').classList.toggle('active', mode === 'pin');
  document.getElementById('map-mode-heat').classList.toggle('active', mode === 'heat');
  
  if (mode === 'pin') {
    map.addLayer(pinLayer);
    map.removeLayer(heatLayer);
  } else {
    map.removeLayer(pinLayer);
    map.addLayer(heatLayer);
  }
}


// ---------- Form Submit & Reset ----------
function submitReport(btn) {
  const originalText = btn.innerHTML;
  btn.innerHTML = 'กำลังส่งข้อมูล... ⏳';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none'; 
  setTimeout(() => {
    document.getElementById('modal-success').classList.add('open');
    document.querySelectorAll('#screen-1 input, #screen-1 select, #screen-1 textarea').forEach(el => el.value = '');
    document.querySelectorAll('#screen-1 .chip').forEach(el => el.classList.remove('on'));
    document.getElementById('other-input').classList.remove('show');
    btn.innerHTML = originalText;
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }, 800);
}

// ---------- 100+ CASES MOCKUP VS 4 CHECKED CASES ----------
const mockLocs = [
  'ฝั่งพญาไท — เตรียมอุดม', 'ฝั่งอังรีฯ — อักษร', 'สามย่าน — MRT', 
  'สยามสแควร์ — ลิโด้', 'ฝั่งพญาไท — คณะวิทย์', 'ฝั่งอังรีฯ — รพ.จุฬาฯ', 
  'สวนหลวง — บรรทัดทอง', 'สามย่าน — มิตรทาวน์', 'สยามสแควร์ — ซอย 5',
  'ฝั่งพญาไท — คณะสถาปัตย์', 'ฝั่งอังรีฯ — สภากาชาด'
];

// 📌 [NEW] เพิ่มข้อมูลระดับความเร่งด่วนเชื่อมโยงกับคำอธิบาย
const urgencyDict = [
  {desc: 'ดูเจ็บป่วย ไม่ตอบสนอง', level: 'ด่วนมาก', colorClass: 'urg-red', weight: 3},
  {desc: 'ตะโกนโวยวาย ก้าวร้าว', level: 'ด่วนมาก', colorClass: 'urg-red', weight: 3},
  {desc: 'มีแผลที่ขา ขวางทางเดิน', level: 'ด่วนมาก', colorClass: 'urg-red', weight: 3},
  {desc: 'เดินเร่ร่อน ขอเงิน', level: 'ปานกลาง', colorClass: 'urg-yellow', weight: 2},
  {desc: 'ท่าทางหิวโหย', level: 'ปานกลาง', colorClass: 'urg-yellow', weight: 2},
  {desc: 'คุยคนเดียว', level: 'ปานกลาง', colorClass: 'urg-yellow', weight: 2},
  {desc: 'นอนหลับอยู่ป้ายรถเมล์', level: 'ทั่วไป', colorClass: 'urg-green', weight: 1},
  {desc: 'มีสัมภาระเยอะมาก', level: 'ทั่วไป', colorClass: 'urg-green', weight: 1},
  {desc: 'นั่งเหม่อลอย', level: 'ทั่วไป', colorClass: 'urg-green', weight: 1},
];

const mockReps = [
  'นิสิตจุฬาฯ (ไม่ระบุ)', 'สมชาย ใ.', 'วิภาวดี ส.', 'บุคคลทั่วไป', 'รปภ. จุฬาฯ',
  'กมลา จ.', 'อาจารย์ คณะวิทย์', 'พลกฤต ม.', 'ณัฐวุฒิ ค.', 'พรพรรณ ต.',
  'สิริมา น.', 'เจ้าหน้าที่เทศกิจ', 'พลเมืองดี', 'ธนพล ว.', 'สุชาติ อ.',
  'อารยา ท.', 'ชลธิชา พ.', 'นิสิต คณะบัญชีฯ', 'วินมอเตอร์ไซค์', 'แม่ค้าแถวสามย่าน'
];

function formatThaiDate(dateObj) {
  const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const d = dateObj.getDate();
  const m = months[dateObj.getMonth()];
  const y = (dateObj.getFullYear() + 543).toString().slice(-2);
  const hr = dateObj.getHours().toString().padStart(2, '0');
  const mn = dateObj.getMinutes().toString().padStart(2, '0');
  return `${d} ${m} ${y} | ${hr}:${mn} น.`;
}

let baseTime = new Date();

// 📌 [UPDATED] สุ่มระดับความเร่งด่วนเพิ่มเข้าไป
const uncheckedTasks = Array.from({length: 100}, (_, i) => {
  let timeGapMinutes = (i * 30) + Math.floor(Math.random() * 600); 
  let taskDate = new Date(baseTime.getTime() - (timeGapMinutes * 60000));
  
  let randomLoc = mockLocs[Math.floor(Math.random() * mockLocs.length)];
  let urgObj = urgencyDict[Math.floor(Math.random() * urgencyDict.length)];
  let randomRep = mockReps[Math.floor(Math.random() * mockReps.length)];

  return {
    id: (500 - i).toString(),
    loc: randomLoc,
    time: formatThaiDate(taskDate),
    rawDate: taskDate.getTime(),
    status: 'ยังไม่ได้ตรวจสอบ',
    sClass: 's-n',
    desc: urgObj.desc,
    urgLevel: urgObj.level,        
    urgClass: urgObj.colorClass,   
    urgWeight: urgObj.weight,
    reporter: randomRep,
    assignee: null,
    hasImg: Math.random() > 0.5
  };
});

let d1 = new Date(); d1.setHours(9,15);
let d2 = new Date(); d2.setHours(8,20);
let d3 = new Date(); d3.setHours(7,10);
let d4 = new Date(); d4.setHours(6,5);

// 📌 [UPDATED] ใส่ระดับความเร่งด่วนให้ข้อมูลเก่าด้วย
const checkedTasks = [
  {id:'399', loc:'สามย่าน — หน้ามิตรทาวน์', assignee:'จนท. มานพ', time:formatThaiDate(d1), rawDate:d1.getTime(), status:'ตรวจสอบแล้ว', sClass:'s-d', desc:'นำส่งศูนย์เรียบร้อย', urgLevel:'ทั่วไป', urgClass:'urg-green', urgWeight:1, reporter:'นาย A.', hasImg: true},
  {id:'398', loc:'สยามสแควร์ — ลิโด้', assignee:'จนท. วิภา', time:formatThaiDate(d2), rawDate:d2.getTime(), status:'ตรวจสอบแล้ว', sClass:'s-d', desc:'เจ็บป่วยเล็กน้อย ปฐมพยาบาลแล้ว', urgLevel:'ด่วนมาก', urgClass:'urg-red', urgWeight:3, reporter:'นาง B.', hasImg: true},
  {id:'397', loc:'ฝั่งพญาไท — คณะวิทย์', assignee:'จนท. ธีระ', time:formatThaiDate(d3), rawDate:d3.getTime(), status:'ตรวจสอบแล้ว', sClass:'s-d', desc:'ขอเงินนิสิต ตักเตือนแล้ว', urgLevel:'ปานกลาง', urgClass:'urg-yellow', urgWeight:2, reporter:'น.ส. C.', hasImg: false},
  {id:'396', loc:'ฝั่งอังรีฯ — รพ.จุฬาฯ', assignee:'จนท. ธีระ', time:formatThaiDate(d4), rawDate:d4.getTime(), status:'ตรวจสอบแล้ว', sClass:'s-d', desc:'นอนพักฟื้น', urgLevel:'ทั่วไป', urgClass:'urg-green', urgWeight:1, reporter:'นาย D.', hasImg: true}
];

let tasksData = [...uncheckedTasks, ...checkedTasks];

// ---------- Dash Table Logic (Sorting & Filtering) ----------
let currentDashData = []; 
let currentDashState = 'unchecked';

function filterDashState(state) {
  currentDashState = state;
  document.getElementById('fb-unc').classList.toggle('active', state === 'unchecked');
  document.getElementById('fb-chk').classList.toggle('active', state === 'checked');

  const kpis = document.getElementById('d-kpis');
  const charts = document.getElementById('d-chart-zones');
  const title = document.getElementById('d-table-title');

  if(state === 'unchecked') {
    kpis.innerHTML = `
      <div class="kpi r"><div class="kpi-val">100+</div><div class="kpi-lbl">ยังไม่ได้ตรวจสอบ</div></div>
      <div class="kpi a"><div class="kpi-val">42</div><div class="kpi-lbl">พบที่ฝั่งพญาไท (บ่อยสุด)</div></div>
      <div class="kpi b"><div class="kpi-val">34</div><div class="kpi-lbl">พบที่ฝั่งอังรีดูนังต์</div></div>
      <div class="kpi g"><div class="kpi-val">3</div><div class="kpi-lbl">จนท. Standby วันนี้</div></div>
    `;
    charts.innerHTML = `
      <div class="bar-row"><div class="b-lbl">ฝั่งพญาไท</div><div class="b-track"><div class="b-fill bg-a" style="width:90%;">42</div></div></div>
      <div class="bar-row"><div class="b-lbl">ฝั่งอังรีฯ</div><div class="b-track"><div class="b-fill bg-b" style="width:75%;">34</div></div></div>
      <div class="bar-row"><div class="b-lbl">สามย่าน</div><div class="b-track"><div class="b-fill bg-gr" style="width:50%;">24</div></div></div>
    `;
    title.textContent = 'รายการยังไม่ได้ตรวจสอบ (ทั้งหมด)';
    currentDashData = [...uncheckedTasks]; 
  } else {
    kpis.innerHTML = `
      <div class="kpi g"><div class="kpi-val">4</div><div class="kpi-lbl">เคสที่ตรวจสอบแล้ว</div></div>
      <div class="kpi b"><div class="kpi-val">4</div><div class="kpi-lbl">ช่วยเหลือสำเร็จ</div></div>
      <div class="kpi a"><div class="kpi-val">2</div><div class="kpi-lbl">พบที่สามย่าน (บ่อยสุด)</div></div>
      <div class="kpi r"><div class="kpi-val">0</div><div class="kpi-lbl">ตกหล่น</div></div>
    `;
    charts.innerHTML = `
      <div class="bar-row"><div class="b-lbl">สามย่าน</div><div class="b-track"><div class="b-fill bg-g" style="width:50%;">2</div></div></div>
      <div class="bar-row"><div class="b-lbl">ฝั่งพญาไท</div><div class="b-track"><div class="b-fill bg-t" style="width:25%;">1</div></div></div>
      <div class="bar-row"><div class="b-lbl">สยาม</div><div class="b-track"><div class="b-fill bg-t" style="width:25%;">1</div></div></div>
    `;
    title.textContent = 'รายการที่ตรวจสอบแล้ว (4)';
    currentDashData = [...checkedTasks];
  }

  // 📌 [UPDATED] ให้เรียงตามระดับความด่วนเป็นหลักเมื่อเปลี่ยนแท็บ
  dashSortCol = 'urgWeight';
  dashSortAsc = false;
  
  applyDashFilters();
}

let dashSortCol = 'urgWeight';
let dashSortAsc = false;

function applyDashFilters() {
  const zoneFilter = document.getElementById('d-zone-filter').value;
  const timeFilter = document.getElementById('d-time-filter').value;
  
  let filteredData = [...currentDashData];

  if (zoneFilter !== 'all') {
    filteredData = filteredData.filter(item => item.loc.includes(zoneFilter));
  }

  const now = new Date().getTime();
  const dayMs = 86400000;
  
  if (timeFilter === 'today') {
    filteredData = filteredData.filter(item => (now - item.rawDate) <= dayMs);
  } else if (timeFilter === '7days') {
    filteredData = filteredData.filter(item => (now - item.rawDate) <= (dayMs * 7));
  } else if (timeFilter === '30days') {
    filteredData = filteredData.filter(item => (now - item.rawDate) <= (dayMs * 30));
  }

  if (dashSortCol !== '') {
    filteredData.sort((a, b) => {
      // 📌 [UPDATED] จัดเรียงรวมถึงคอลัมน์ urgWeight เข้าไป
      if (dashSortCol === 'rawDate' || dashSortCol === 'id' || dashSortCol === 'urgWeight') {
        let valA = parseInt(a[dashSortCol]) || 0;
        let valB = parseInt(b[dashSortCol]) || 0;
        if(dashSortCol === 'urgWeight' && valA === valB) {
           return b.rawDate - a.rawDate; 
        }
        return dashSortAsc ? valA - valB : valB - valA;
      }
      
      let strA = String(a[dashSortCol] || '');
      let strB = String(b[dashSortCol] || '');
      return dashSortAsc ? strA.localeCompare(strB, 'th') : strB.localeCompare(strA, 'th');
    });
  }

  const titleStr = currentDashState === 'unchecked' ? 'รายการยังไม่ได้ตรวจสอบ' : 'รายการที่ตรวจสอบแล้ว';
  document.getElementById('d-table-title').textContent = `${titleStr} (${filteredData.length} รายการ)`;

  renderDashTable(filteredData);
  updateDashSortIcons();
}

function sortDashTable(col) {
  if (dashSortCol === col) {
    dashSortAsc = !dashSortAsc; 
  } else {
    dashSortCol = col;
    // 📌 [UPDATED] ถ้าเรียงตามความด่วน ก็ให้เริ่มจากแดงก่อนเสมอ (false = 3->1)
    dashSortAsc = (col === 'rawDate' || col === 'id' || col === 'urgWeight') ? false : true;
  }
  applyDashFilters(); 
}

function updateDashSortIcons() {
  // 📌 [UPDATED] เพิ่ม urgWeight เข้าไปในลิสต์ให้อัปเดตลูกศร
  const cols = ['id', 'rawDate', 'urgWeight', 'loc', 'reporter', 'status'];
  cols.forEach(c => {
    const el = document.getElementById('dsort-' + c);
    if(el) {
      if (c === dashSortCol) {
        el.textContent = dashSortAsc ? '↑' : '↓';
        el.style.color = 'var(--g)';
      } else {
        el.textContent = '↕';
        el.style.color = 'var(--txh)';
      }
    }
  });
}

function renderDashTable(dataList) {
  const tbody = document.getElementById('d-table-body');
  
  if (dataList.length === 0) {
    // แก้ colspan เป็น 6 ให้สอดคล้องกับคอลัมน์ใหม่
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--txs);">ไม่พบข้อมูลที่ตรงกับตัวกรอง</td></tr>`;
    return;
  }

  tbody.innerHTML = dataList.map(t => `
    <tr>
      <td>#${t.id}</td>
      <td style="font-size:11.5px;">${t.time}</td>
      <td><span class="urg-badge ${t.urgClass}">${t.urgLevel}</span></td> <td>${t.loc}</td>
      <td>${t.reporter}</td>
      <td><span class="badge ${t.sClass === 's-n' ? 'bg-red' : ''}" style="${t.sClass === 's-n' ? 'background:#ffeaea;color:#c0392b;' : 'background:var(--gl);color:var(--gp);'}">${t.status}</span></td>
    </tr>
  `).join('');
}


// ---------- Staff Management Data & Logic ----------
let staffData = [
  {id:'st1', name:'จนท. ธีระ', role:'พื้นที่: ฝั่งอังรีดูนังต์', done:4, total:6, icon:'👮‍♂️', bg:'var(--gl)', border:'#f8cdda', color:'var(--g)'},
  {id:'st2', name:'จนท. วิภา', role:'พื้นที่: ฝั่งพญาไท', done:1, total:5, icon:'👩‍⚕️', bg:'#fff5e0', border:'#ffe6b3', color:'var(--amber)'},
  {id:'st3', name:'จนท. มานพ', role:'พื้นที่: สามย่าน, สยาม', done:8, total:10, icon:'👨‍💼', bg:'#e6f0ff', border:'#b3d4ff', color:'var(--blue)'}
];

function renderStaffGrid() {
  const sortVal = document.getElementById('staff-sort').value;
  let sortedStaff = [...staffData];
  if (sortVal === 'avail') {
    sortedStaff.sort((a,b) => (b.total - b.done) - (a.total - a.done));
  } else if (sortVal === 'load') {
    sortedStaff.sort((a,b) => (b.done/b.total) - (a.done/a.total));
  }

  const container = document.getElementById('staff-grid-container');
  if(!container) return;
  
  container.innerHTML = sortedStaff.map(s => {
    let pct = Math.round((s.done / s.total) * 100);
    let statusText = `ปิดเคสแล้ว ${s.done}/${s.total} วันนี้` + (pct === 100 ? ' (ว่าง)' : '');
    return `
      <div class="staff-card">
        <div class="st-ava" style="background:${s.bg};border-color:${s.border};">${s.icon}</div>
        <div class="st-info">
          <div class="st-name">${s.name}</div>
          <div class="st-role">${s.role}</div>
          <div class="st-prog-w"><div class="st-prog" style="width:${pct}%;background:${s.color};"></div></div>
          <div class="st-stat">${statusText}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------- Sorting Logic (Table in Staff View) ----------
let currentSortCol = 'urgWeight'; // 📌 เปลี่ยนให้เรียงตามความด่วนเป็นหลัก
let sortAsc = false;

function sortTasks(col) {
  if (currentSortCol === col) {
    sortAsc = !sortAsc;
  } else {
    currentSortCol = col;
    sortAsc = (col === 'urgWeight' || col === 'rawDate' || col === 'id') ? false : true;
  }

  tasksData.sort((a, b) => {
    if (col === 'urgWeight' || col === 'rawDate' || col === 'id') {
      let valA = parseInt(a[col]) || 0;
      let valB = parseInt(b[col]) || 0;
      if(col === 'urgWeight' && valA === valB) return b.rawDate - a.rawDate; 
      return sortAsc ? valA - valB : valB - valA;
    }
    
    let valA, valB;
    if (col === 'action') {
      valA = a.assignee ? 'ดูรายละเอียด' : 'มอบหมายงาน';
      valB = b.assignee ? 'ดูรายละเอียด' : 'มอบหมายงาน';
    } else {
      valA = a[col] === null ? 'ฮฮฮ' : String(a[col]);
      valB = b[col] === null ? 'ฮฮฮ' : String(b[col]);
    }
    return sortAsc ? valA.localeCompare(valB, 'th') : valB.localeCompare(valA, 'th');
  });

  renderTaskTable();
  updateSortIcons();
}

function updateSortIcons() {
  const cols = ['id', 'loc', 'assignee', 'rawDate', 'urgWeight', 'status', 'action']; // 📌 NEW
  cols.forEach(c => {
    const el = document.getElementById('sort-' + c);
    if(el) {
      if (c === currentSortCol) {
        el.textContent = sortAsc ? '↑' : '↓';
        el.style.color = 'var(--g)';
      } else {
        el.textContent = '↕';
        el.style.color = 'var(--txh)';
      }
    }
  });
}

function renderTaskTable() {
  const tbody = document.getElementById('task-table-body');
  if(!tbody) return;
  
  tbody.innerHTML = tasksData.map(t => {
    let assigneeHtml = t.assignee ? t.assignee : '<span style="color:#aaa;">- ยังไม่มอบหมาย -</span>';
    let actionHtml = t.assignee 
      ? `<span class="link-btn" onclick="openTaskDetails('${t.id}')">ดูรายละเอียด</span>`
      : `<span class="link-btn act" onclick="openAssignTask('${t.id}')">➕ มอบหมายงาน</span>`;
    
    return `
      <tr>
        <td>#${t.id}</td>
        <td>${t.loc}</td>
        <td>${assigneeHtml}</td>
        <td style="font-size:11.5px;">${t.time}</td>
        <td><span class="urg-badge ${t.urgClass}">${t.urgLevel}</span></td> <td><span class="sdot ${t.sClass}"></span>${t.status}</td>
        <td>${actionHtml}</td>
      </tr>
    `;
  }).join('');
}

// 📌 [UPDATED] แทรกข้อมูลความเร่งด่วนลงในหน้าจอ Modal รายละเอียด
function openTaskDetails(id) {
  const t = tasksData.find(x => x.id === id);
  if(!t) return;
  document.getElementById('md-id').textContent = '#' + t.id;
  document.getElementById('md-loc').textContent = t.loc;
  document.getElementById('md-desc').textContent = t.desc;
  document.getElementById('md-time').textContent = t.time;
  document.getElementById('md-reporter').textContent = t.reporter;
  document.getElementById('md-assignee').textContent = t.assignee || 'ยังไม่ระบุ';

  if(document.getElementById('md-urgency')){
     document.getElementById('md-urgency').innerHTML = `<span class="urg-badge ${t.urgClass}">${t.urgLevel}</span>`;
  }
  
  let badgeColor = t.sClass === 's-d' ? 'var(--gl)' : (t.sClass === 's-n' ? '#ffeaea' : '#fff8e6');
  let textColor = t.sClass === 's-d' ? 'var(--gp)' : (t.sClass === 's-n' ? 'var(--red)' : '#a06000');
  document.getElementById('md-status').innerHTML = `<span class="badge" style="background:${badgeColor};color:${textColor};">${t.status}</span>`;
  
  const imgBox = document.getElementById('md-image');
  const noImgBox = document.getElementById('md-no-image');
  const imgCaption = document.getElementById('md-img-caption');
  
  if (t.hasImg) {
    imgBox.style.display = 'flex';
    noImgBox.style.display = 'none';
    imgCaption.textContent = 'ถ่ายโดย: ' + (t.assignee || t.reporter);
  } else {
    imgBox.style.display = 'none';
    noImgBox.style.display = 'block';
  }
  
  document.getElementById('modal-details').classList.add('open');
}

let assigningTaskId = null;
function openAssignTask(id) {
  const t = tasksData.find(x => x.id === id);
  if(!t) return;
  assigningTaskId = id;
  document.getElementById('ma-id').textContent = '#' + t.id;
  document.getElementById('ma-loc').textContent = t.loc;
  
  const sel = document.getElementById('ma-select');
  sel.innerHTML = '<option value="">-- เลือกเจ้าหน้าที่ --</option>' + 
    staffData.map(s => `<option value="${s.name}">${s.name} (${s.role})</option>`).join('');
    
  document.getElementById('modal-assign').classList.add('open');
}

function confirmAssign() {
  const selVal = document.getElementById('ma-select').value;
  if(!selVal) { showToast('กรุณาเลือกเจ้าหน้าที่ก่อน!'); return; }
  
  let t = tasksData.find(x => x.id === assigningTaskId);
  if(t) {
    t.assignee = selVal;
    t.status = 'กำลังลงพื้นที่';
    t.sClass = 's-p';
  }
  
  let s = staffData.find(x => x.name === selVal);
  if(s) { s.total += 1; }

  closeAllModals();
  sortTasks(currentSortCol); 
  renderStaffGrid();
  filterDashState('unchecked');
  showToast('มอบหมายงานให้ ' + selVal + ' สำเร็จ!');
}

// ---------- Bus Stop Checker (Screen 5) ----------
const cuStopsData = {
  'ฝั่งพญาไท': ['ป้ายเตรียมอุดม', 'ป้ายคณะวิทยาศาสตร์', 'ป้ายคณะสถาปัตย์'],
  'ฝั่งอังรีดูนังต์': ['ป้ายคณะอักษรศาสตร์', 'ป้าย รพ.จุฬาฯ', 'หน้าสภากาชาดไทย'],
  'สามย่าน': ['MRT สามย่าน', 'หน้าสามย่านมิตรทาวน์', 'หน้าวัดหัวลำโพง'],
  'สยามสแควร์': ['ป้ายลิโด้', 'ป้ายสยามเซ็นเตอร์', 'BTS สยาม'],
  'สวนหลวง': ['ป้าย Stadium One', 'อุทยาน 100 ปี จุฬาฯ']
};

function bsUpdateStops(d) {
  const s = document.getElementById('bs-stop');
  s.innerHTML = '<option value="">-- เลือกป้าย --</option>';
  (cuStopsData[d] || []).forEach(v => {
    const o = document.createElement('option'); o.value = v; o.textContent = v; s.appendChild(o);
  });
  document.getElementById('bs-result').style.display = 'none';
}

function bsUpdateGraph() {
  const container = document.getElementById('bs-graph-bars');
  if(!container) return;

  const timeVal = document.getElementById('bs-time-range').value;
  let labels = [];
  if(timeVal === 'morning') labels = ['06:00','07:00','08:00','09:00','10:00'];
  else if(timeVal === 'noon') labels = ['10:00','11:00','12:00','13:00','14:00'];
  else if(timeVal === 'afternoon') labels = ['14:00','15:00','16:00','17:00','18:00'];
  else if(timeVal === 'evening') labels = ['18:00','19:00','20:00','21:00','22:00'];

  const data = [10, 30, 85, 65, 40]; 
  const randomFactor = Math.floor(Math.random() * 15) - 5; 

  container.innerHTML = data.map((val, i) => {
    let finalVal = val + randomFactor;
    if(finalVal > 100) finalVal = 100;
    if(finalVal < 5) finalVal = 5;
    const color = finalVal > 70 ? '#e74c3c' : (finalVal > 40 ? '#f5a623' : '#e91e63');
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;">
        <div style="width:100%;max-width:24px;background:${color};height:${finalVal}%;border-radius:4px 4px 0 0;transition:all 0.4s ease;"></div>
        <div style="position:absolute;bottom:-22px;font-size:10px;color:var(--txs);font-weight:600;">${labels[i]}</div>
      </div>
    `;
  }).join('');
}

function toggleBusRoutes(){
  const body=document.getElementById('bs-routes-body');
  const arrow=document.getElementById('bs-routes-arrow');
  const open=body.style.display==='none';
  body.style.display=open?'block':'none';
  arrow.style.transform=open?'rotate(180deg)':'';
}

function toggleRoutePlaces(idx) {
  const places = document.getElementById('r-places-' + idx);
  const arrow = document.getElementById('r-arrow-' + idx);
  const isOpen = places.style.display === 'block';
  places.style.display = isOpen ? 'none' : 'block';
  arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
}

const bsData={
  'ป้ายเตรียมอุดม':{count:12, lastTime:'2 ชม. ที่แล้ว', status:'กำลังดำเนินการ', routes:[{no:'21',color:'#e74c3c',to:'จุฬาฯ–วัดคู่สร้าง'},{no:'25',color:'#f5a623',to:'แพรกษา–ท่าช้าง'},{no:'36',color:'#2d8cf0',to:'ห้วยขวาง–ท่าน้ำสี่พระยา'}]},
  'ป้ายคณะวิทยาศาสตร์':{count:5, lastTime:'5 ชม. ที่แล้ว', status:'เสร็จสิ้นแล้ว', routes:[{no:'47',color:'#e74c3c',to:'ท่าเรือคลองเตย–กรมที่ดิน'},{no:'141',color:'#1D9E75',to:'แสมดำ–จุฬาฯ'}]},
  'ป้ายคณะอักษรศาสตร์':{count:18, lastTime:'15 นาที ที่แล้ว', status:'รอดำเนินการ', routes:[{no:'16',color:'#e74c3c',to:'หมอชิต2–สุรวงศ์'},{no:'21',color:'#2d8cf0',to:'จุฬาฯ–วัดคู่สร้าง'}]},
  'ป้าย รพ.จุฬาฯ':{count:24, lastTime:'1 ชม. ที่แล้ว', status:'กำลังดำเนินการ', routes:[{no:'15',color:'#e74c3c',to:'BRT ราชพฤกษ์–บางลำพู'},{no:'77',color:'#f5a623',to:'เซ็นทรัลพระราม 3–หมอชิต2'}]},
  'MRT สามย่าน':{count:35, lastTime:'3 ชม. ที่แล้ว', status:'เสร็จสิ้นแล้ว', routes:[{no:'MRT',color:'#185FA5',to:'บางซื่อ–หัวลำโพง'},{no:'4',color:'#7c4dff',to:'ท่าน้ำภาษีเจริญ–ท่าเรือคลองเตย'}]},
  'หน้าสามย่านมิตรทาวน์':{count:15, lastTime:'30 นาที ที่แล้ว', status:'เจ้าหน้าที่ลงพื้นที่', routes:[{no:'21',color:'#e74c3c',to:'จุฬาฯ–วัดคู่สร้าง'},{no:'40',color:'#f5a623',to:'สายใต้(ปิ่นเกล้า)–ลำสาลี'}]}
};

function bsShowResult(stop){
  if(!stop){document.getElementById('bs-result').style.display='none';return;}
  const d=bsData[stop]||{count:0, lastTime:'ไม่มีการแจ้ง', status:'ปกติ', routes:[{no:'15',color:'#e74c3c',to:'BRT ราชพฤกษ์–บางลำพู'},{no:'47',color:'#1D9E75',to:'คลองเตย–กรมที่ดิน'}]};
  
  document.getElementById('bs-count').textContent=d.count;
  document.getElementById('bs-last-time').textContent=d.lastTime;
  
  const st = document.getElementById('bs-status');
  st.textContent = d.status;
  if(d.status === 'รอดำเนินการ' || d.status === 'กำลังลงพื้นที่') {
    st.style.background = '#fff8e6'; st.style.color = '#a06000';
  } else if(d.status === 'เสร็จสิ้นแล้ว' || d.status === 'ปกติ') {
    st.style.background = 'var(--gl)'; st.style.color = 'var(--gp)';
  } else {
    st.style.background = 'var(--g)'; st.style.color = '#fff';
  }

  bsUpdateGraph();
  document.getElementById('bs-routes-body').style.display='none';
  document.getElementById('bs-routes-arrow').style.transform='';

  const rc=document.getElementById('bs-routes');
  rc.innerHTML=d.routes.map((r, idx)=>{
    const parts = r.to.split(/–|-/);
    const start = parts[0] ? parts[0].trim() : 'ต้นทาง';
    const end = parts[1] ? parts[1].trim() : 'ปลายทาง';

    return `<div onclick="toggleRoutePlaces(${idx})" style="padding:9px 0;border-bottom:1px solid #eef5f1;cursor:pointer;transition:background .15s;" onmouseover="this.style.background='#f9fdfb'" onmouseout="this.style.background='transparent'">
      <div style="display:flex;align-items:center;gap:8px;font-size:11.5px;">
        <div style="min-width:36px;height:22px;background:${r.color};border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;">${r.no}</div>
        <div style="color:var(--txs);flex:1;font-weight:600;">${r.to}</div>
        <span id="r-arrow-${idx}" style="font-size:14px;color:var(--gm);transition:transform .2s;">▾</span>
      </div>
      <div id="r-places-${idx}" style="display:none; padding-top:10px; padding-left:44px; font-size:10.5px; color:var(--txs);">
        <div style="display:flex; align-items:flex-start; gap:6px; margin-bottom:6px;">
          <div style="color:var(--g); font-size:12px;">📍</div>
          <div>
            <div style="font-weight:700; color:var(--gp); margin-bottom:4px;">เส้นทางผ่านโดยประมาณ:</div>
            <div style="line-height:1.7;">
              • ${start}<br>
              • จุดจอดสำคัญระหว่างทาง<br>
              • ${end}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('bs-result').style.display='block';
}

function openExternalApp(os) {
  const appScheme = 'tsbgoplusapp://'; 
  let storeUrl = '';
  if (os === 'ios') {
    storeUrl = 'https://apps.apple.com/th/app/tsb-go-plus/id6463791254';
  } else if (os === 'android') {
    storeUrl = 'https://play.google.com/store/apps/details?id=com.tsb.goplus'; 
  }
  window.location.href = appScheme;
  setTimeout(() => {
    if (!document.hidden) {
      window.location.href = storeUrl;
    }
  }, 1500);
}

// ---------- REAL MAP INTEGRATION (Leaflet + MarkerCluster) ----------
let map, pinLayer, heatLayer;

// พิกัดจริงบริเวณรอบจุฬาฯ
const cuCoords = {
  'ฝั่งพญาไท — เตรียมอุดม': [13.7405, 100.5300],
  'ฝั่งอังรีฯ — อักษร': [13.7380, 100.5345],
  'สามย่าน — MRT': [13.7325, 100.5280],
  'สยามสแควร์ — ลิโด้': [13.7450, 100.5320],
  'ฝั่งพญาไท — คณะวิทย์': [13.7385, 100.5295],
  'ฝั่งอังรีฯ — รพ.จุฬาฯ': [13.7320, 100.5360],
  'สวนหลวง — บรรทัดทอง': [13.7380, 100.5240],
  'สามย่าน — มิตรทาวน์': [13.7340, 100.5285],
  'สยามสแควร์ — ซอย 5': [13.7445, 100.5335],
  'ฝั่งพญาไท — คณะสถาปัตย์': [13.7390, 100.5290],
  'ฝั่งอังรีฯ — สภากาชาด': [13.7335, 100.5340]
};

// สร้าง circle pin icon ที่ดูสะอาด + pulse animation สำหรับด่วน
function makePinIcon(fillColor, borderColor, pulseColor) {
  const pulse = pulseColor
    ? `<div style="position:absolute;inset:-5px;border-radius:50%;background:${pulseColor};opacity:0;animation:ripple 2s ease-out infinite;"></div>`
    : '';
  return L.divIcon({
    className: 'leaflet-div-icon',
    html: `<div style="position:relative;width:20px;height:20px;">
             ${pulse}
             <div style="width:20px;height:20px;border-radius:50%;background:${fillColor};border:3px solid ${borderColor};box-shadow:0 2px 8px rgba(0,0,0,0.3);position:relative;z-index:1;"></div>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14]
  });
}

const dropIcons = {
  red:    makePinIcon('#e74c3c', '#fff', 'rgba(231,76,60,0.5)'),
  yellow: makePinIcon('#f1a825', '#fff', null),
  green:  makePinIcon('#27ae60', '#fff', null)
};

// สร้าง popup HTML แบบ custom
function makePopupHTML(t) {
  const urgColors = { 'ด่วนมาก': '#e74c3c', 'ปานกลาง': '#f1a825', 'ทั่วไป': '#27ae60' };
  const urg = t.urgLevel || 'ทั่วไป';
  const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${urgColors[urg]};margin-right:5px;"></span>`;
  return `
    <div class="cu-popup-hdr">#${t.id} &nbsp;·&nbsp; ${t.loc}</div>
    <div class="cu-popup-body">
      <div class="cu-popup-row"><b>⚡ ระดับ</b>${dot}${urg}</div>
      <div class="cu-popup-row"><b>📝 อาการ</b>${t.desc}</div>
      <div class="cu-popup-row"><b>🕒 เวลา</b>${t.time}</div>
      <div class="cu-popup-row"><b>📌 สถานะ</b>${t.status}</div>
    </div>`;
}

function updateMapStats() {
  const validTasks = tasksData.filter(t => cuCoords[t.loc]);
  const r = validTasks.filter(t => t.urgWeight === 3).length;
  const y = validTasks.filter(t => t.urgWeight === 2).length;
  const g = validTasks.filter(t => t.urgWeight === 1).length;
  document.getElementById('map-count-red').textContent    = r;
  document.getElementById('map-count-yellow').textContent = y;
  document.getElementById('map-count-green').textContent  = g;
  document.getElementById('map-count-total').textContent  = validTasks.length;
}

function initMap() {
  map = L.map('real-map', { zoomControl: true, attributionControl: true })
         .setView([13.7367, 100.5331], 15);

  // CartoDB Positron — แผนที่สีอ่อน สะอาด เหมาะกับ UI
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors, © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 20
  }).addTo(map);

  // ย้าย zoom control ไปมุมซ้ายล่าง (ไม่ชนกับ legend)
  map.zoomControl.setPosition('bottomleft');

  // pinLayer ใช้ MarkerClusterGroup แทน LayerGroup
  pinLayer = L.markerClusterGroup({
    maxClusterRadius: 50,
    iconCreateFunction: function(cluster) {
      const count = cluster.getChildCount();
      const size = count < 10 ? 36 : count < 50 ? 42 : 48;
      return L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:var(--g);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${size < 40 ? 12 : 13}px;font-weight:800;border:3px solid #fff;box-shadow:0 3px 10px rgba(233,30,99,.4);font-family:var(--fn);">${count}</div>`,
        className: '', iconSize: [size, size], iconAnchor: [size/2, size/2]
      });
    }
  });

  heatLayer = L.layerGroup();

  tasksData.forEach(t => {
    const baseCoord = cuCoords[t.loc];
    if (!baseCoord) return;

    const lat = baseCoord[0] + (Math.random() - 0.5) * 0.0004;
    const lng = baseCoord[1] + (Math.random() - 0.5) * 0.0004;

    // เลือก icon ตามความเร่งด่วน
    const icon = t.urgWeight === 3 ? dropIcons.red :
                 t.urgWeight === 2 ? dropIcons.yellow : dropIcons.green;

    // เพิ่ม marker + custom popup
    L.marker([lat, lng], { icon })
     .bindPopup(makePopupHTML(t), { maxWidth: 220, className: 'cu-popup' })
     .addTo(pinLayer);

    // Heatmap circle
    const hColor = t.urgWeight === 3 ? '#e74c3c' :
                   t.urgWeight === 2 ? '#f1a825' : '#27ae60';
    L.circle([lat, lng], {
      color: hColor, fillColor: hColor, fillOpacity: 0.22,
      radius: 45, stroke: false
    }).addTo(heatLayer);
  });

  pinLayer.addTo(map);
  updateMapStats();
}


// Init calls
window.onload = function() {
  sortTasks('urgWeight'); 
  renderStaffGrid();
  // initMap() ถูกย้ายไปเรียกใน switchDash(2) แทน (lazy init)
};