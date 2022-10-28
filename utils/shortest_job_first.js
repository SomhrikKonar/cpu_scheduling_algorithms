let form = document.querySelector("form");
form.onsubmit = function (e) {
  e.preventDefault();
  let data = shortest_job_first();
  paintDOM(data);
};
const shortest_job_first = () => {
  let arrival_time_inputs = document.querySelector("#arrival_times").value;
  let burst_time_inputs = document.querySelector("#burst_times").value;

  let arrival_times = arrival_time_inputs.split(" ");
  let burst_times = burst_time_inputs.split(" ");

  if (arrival_times.length !== burst_times.length) {
    alert("Number of Arrival_Times must match number of Burst_Times");
    return;
  }

  let allProcesses = arrival_times.map((item, index) => ({
    index: index,
    id: `P${index + 1}`,
    arrival_time: parseInt(item),
    burst_time: parseInt(burst_times[index]),
  }));
  allProcesses.sort((a, b) => a.arrival_time - b.arrival_time);
  let first_task = allProcesses[0];
  allProcesses.shift();

  let sortedAllProcess = allProcesses.sort(
    (a, b) => a.burst_time - b.burst_time
  );

  sortedAllProcess.unshift(first_task);

  let data = [];
  let time = 0;
  let i = 0;

  while (sortedAllProcess.length > 0) {
    if (sortedAllProcess[i].arrival_time <= time) {
      time += sortedAllProcess[i].burst_time;
      data.push({
        index: sortedAllProcess[i].index,
        id: sortedAllProcess[i].id,
        arrival_time: sortedAllProcess[i].arrival_time,
        burst_time: sortedAllProcess[i].burst_time,
        exit_time: time,
      });
      sortedAllProcess.shift();
    } else {
      time += 1;
    }
  }

  for (let i = 0; i < sortedAllProcess.length; i++) {
    time += sortedAllProcess[i].burst_time;
    data.push({
      index: sortedAllProcess[i].index,
      id: sortedAllProcess[i].id,
      arrival_time: sortedAllProcess[i].arrival_time,
      burst_time: sortedAllProcess[i].burst_time,
      exit_time: time,
    });
  }

  data.sort((a, b) => a.index - b.index);

  let table_data = data.map((process) => {
    let turn_around_time = process.exit_time - process.arrival_time;
    let waiting_time = turn_around_time - process.burst_time;
    return {
      ...process,
      turn_around_time,
      waiting_time,
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
