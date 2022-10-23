let form = document.querySelector("form");
form.onsubmit = function (e) {
  e.preventDefault();
  let data = round_robin();
  paintDOM(data);
};
const round_robin = () => {
  let arrival_time_inputs = document.querySelector("#arrival_times").value;
  let burst_time_inputs = document.querySelector("#burst_times").value;
  let time_quantum = document.querySelector("#time_quantum").value;
  time_quantum = parseInt(time_quantum);
  let arrival_times = arrival_time_inputs.split(" ");
  let burst_times = burst_time_inputs.split(" ");
  if (arrival_times.length !== burst_times.length) {
    alert("Number of Arrival_Times must match number of Burst_Times");
    return;
  }
  let time = 0;
  const allProcesses = getObj(arrival_times, burst_times);
  let remainingProcesses = [...allProcesses];
  let q = [];
  let gantt_chart = [];
  let exit_times = {};
  let a = getProcessToAdd(remainingProcesses, time);
  q.push(...a.removed_elements);
  remainingProcesses = [...a.new_list];
  let c = 0;
  while (q.length > 0 || remainingProcesses.length > 0) {
    c += 1;
    if (q.length > 0) {
      let process = q[0];
      q.shift();
      gantt_chart.push({ item: process["id"], time: time });
      if (process.remaining_time > time_quantum) {
        time += time_quantum;
        process["remaining_time"] = process.remaining_time - time_quantum;
        if (remainingProcesses.length > 0) {
          a = getProcessToAdd(remainingProcesses, time);
          q.push(...a.removed_elements, process);
          remainingProcesses = [...a.new_list];
        } else {
          q.push(process);
        }
      } else {
        time += process.remaining_time;
        if (remainingProcesses.length > 0) {
          a = getProcessToAdd(remainingProcesses, time);
          q.push(...a.removed_elements);
          remainingProcesses = [...a.new_list];
        }
        exit_times[process.id] = time;
      }
    }
  }

  let table_data = allProcesses.map((process) => {
    let turn_around_time = exit_times[process.id] - process.arrival_time;
    let waiting_time = turn_around_time - process.burst_time;
    return {
      ...process,
      turn_around_time,
      waiting_time,
      exit_time: exit_times[process.id],
    };
  });
  return table_data;
};

let columnKeys = [
  "id",
  "arrival_time",
  "burst_time",
  "exit_time",
  "turn_around_time",
  "waiting_time",
];

function formatKey(key) {
  let new_key = "";
  for (let i = 0; i < key.length; i++) {
    new_key += i == 0 ? key[i].toUpperCase() : key[i] === "_" ? " " : key[i];
  }
  return new_key;
}

function paintDOM(data) {
  //dom element
  let table_container = document.querySelector("#table_container");
  table_container.innerHTML = "";

  // header element
  let header = document.createElement("h3");
  header.innerText = "Table:";

  //table elements
  let table = document.createElement("table");
  let table_head = document.createElement("thead");
  let table_body = document.createElement("tbody");

  //added header
  let head_row = document.createElement("tr");
  columnKeys.map((key) => {
    let td = document.createElement("td");
    td.innerText = formatKey(key);
    head_row.appendChild(td);
  });
  table_head.append(head_row);

  // filling table body
  let total_wait_time = 0,
    total_turn_around_time = 0;

  data.map((item) => {
    let row = document.createElement("tr");
    total_turn_around_time += item["turn_around_time"];
    total_wait_time += item["waiting_time"];
    columnKeys.map((key) => {
      let td = document.createElement("td");
      td.innerText = item[key];
      row.appendChild(td);
    });
    table_body.append(row);
  });

  // appending thead and tbody in table
  table.append(table_head);
  table.append(table_body);

  //adding table and header in dom
  table_container.append(header);
  table_container.append(table);

  //  creating element to dispaly total_wait_time and total_turn_around_time
  let avgTurnAroundHeader = document.createElement("h4");
  avgTurnAroundHeader.innerText = `Average Turn Around Time = ${
    total_turn_around_time / data.length
  }`;
  table_container.append(avgTurnAroundHeader);
  let avgWaitingHeader = document.createElement("h4");
  avgWaitingHeader.innerText = `Average Waiting Time = ${
    total_wait_time / data.length
  }`;
  table_container.append(avgWaitingHeader);
}

function getObj(arrival_times, burst_times) {
  let list = [];
  for (let i = 0; i < arrival_times.length; i++) {
    list.push({
      id: `P${i + 1}`,
      arrival_time: parseInt(arrival_times[i]),
      burst_time: parseInt(burst_times[i]),
      remaining_time: parseInt(burst_times[i]),
    });
  }
  return list;
}

function getProcessToAdd(obj, time) {
  let new_list = [];
  let removed_elements = [];
  obj.map((val) => {
    if (val.arrival_time <= time) removed_elements.push(val);
    else new_list.push(val);
  });
  return { removed_elements, new_list };
}
