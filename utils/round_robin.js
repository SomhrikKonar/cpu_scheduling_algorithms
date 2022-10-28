let form = document.querySelector("form");
form.onsubmit = function (e) {
  e.preventDefault();
  let { table_data, gantt_chart } = round_robin();
  if (!Array.isArray(table_data)) return;
  paintDOM(table_data, gantt_chart);
};
const round_robin = () => {
  let arrival_time_inputs = document
    .querySelector("#arrival_times")
    .value.trim();
  let burst_time_inputs = document.querySelector("#burst_times").value.trim();
  let time_quantum = document.querySelector("#time_quantum").value.trim();
  time_quantum = parseInt(time_quantum);
  let arrival_times = arrival_time_inputs.split(" ");
  let burst_times = burst_time_inputs.split(" ");
  if (arrival_times.length !== burst_times.length) {
    alert("Number of Arrival_Times must match number of Burst_Times");
    return;
  }
  let allProcesses = getObj(arrival_times, burst_times);
  if (!Array.isArray(allProcesses)) return;
  allProcesses.sort((a, b) => a.arrival_time - b.arrival_time);
  let remainingProcesses = [...allProcesses];
  let q = [];
  let gantt_chart = [];
  let exit_times = {};
  let time = allProcesses[0].arrival_time;
  let a = getProcessToAdd(remainingProcesses, time);
  q.push(...a.removed_elements);
  remainingProcesses = [...a.new_list];
  while (q.length > 0 || remainingProcesses.length > 0) {
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
    } else {
      gantt_chart.push({ item: "_", time: time });
      time += 1;
      a = getProcessToAdd(remainingProcesses, time);
      q.push(...a.removed_elements);
      remainingProcesses = [...a.new_list];
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
  return { table_data, gantt_chart };
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

function paintDOM(data, gantt_chart) {
  //dom element
  let table_container = document.querySelector("#table_container");
  let gantt_chart_parent_container = document.querySelector(
    "#gantt_chart_container"
  );
  table_container.innerHTML = "";
  gantt_chart_parent_container.innerHTML = "";

  // gantt chart
  let gantt_chart_header = document.createElement("h2");
  gantt_chart_header.innerHTML = "Gantt Chart: ";
  gantt_chart_parent_container.append(gantt_chart_header);
  let gantt_chart_container = document.createElement("div");
  gantt_chart_container.id = "gantt_chart";
  gantt_chart.map(({ item, time }, index) => {
    if (gantt_chart[index - 1]?.item === "_" && item === "_") {
    } else {
      let box = document.createElement("div");
      box.innerHTML = item;
      gantt_chart_container.append(box);
    }
  });
  gantt_chart_parent_container.append(gantt_chart_container);

  //table

  // header element
  let header = document.createElement("h2");
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
    if (parseInt(burst_times[i]) <= 0) {
      alert("Invalid Burst Time");
      return;
    }
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
