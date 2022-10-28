let form = document.querySelector("form");
form.onsubmit = function (e) {
  e.preventDefault();
  let data = shortest_remaining_time_first();
  paintDOM(data);
};
const shortest_remaining_time_first = () => {
  let arrival_time_inputs = document.querySelector("#arrival_times").value;
  let burst_time_inputs = document.querySelector("#burst_times").value;

  let arrival_times = arrival_time_inputs.split(" ");
  let burst_times = burst_time_inputs.split(" ");

  if (arrival_times.length !== burst_times.length) {
    alert("Number of Arrival_Times must match number of Burst_Times");
    return;
  }

  let allProcessesHashCopy = {};
  let allProcesses = arrival_times.map((item, index) => {
    let b = parseInt(burst_times[index]);
    allProcessesHashCopy[index] = {
      arrival_time: parseInt(item),
      burst_time: b,
    };
    return {
      id: index,
      arrival_time: parseInt(item),
      burst_time: b,
    };
  });

  //sorting all processes based on arrival time
  allProcesses.sort((a, b) => a.arrival_time - b.arrival_time);

  //main
  let finalArr = [];
  let q = [];
  let time = 0;
  while (q.length > 0 || allProcesses.length > 0) {
    let newElements = getNewElements(allProcesses, time);
    if (newElements.add_to_q.length > 0) q.push(...newElements.add_to_q);
    //updating allProcesses and q
    allProcesses = [...newElements.available_processes];
    q = sortProcesses(q);
    time += 1;
    if (q.length > 0) {
      let ele = q[0];
      if (ele.burst_time - 1 === 0) {
        let turn_around_time = time - allProcessesHashCopy[ele.id].arrival_time;
        let waiting_time =
          turn_around_time - allProcessesHashCopy[ele.id].burst_time;
        finalArr.push({
          ...allProcessesHashCopy[ele.id],
          process_id: `P${ele.id + 1}`,
          id: ele.id,
          exit_time: time,
          turn_around_time,
          waiting_time,
        });
        q.shift();
      } else {
        q[0].burst_time -= 1;
      }
    }
  }
  //sorting final arr based on id's
  finalArr.sort((a, b) => a.id - b.id);
  return finalArr;
};

const sortProcesses = (arr) => {
  arr.sort((a, b) => a.burst_time - b.burst_time);
  return [...arr];
};

const getNewElements = (arr, time) => {
  let elements = { add_to_q: [], available_processes: [] };
  arr.forEach((ele) => {
    if (ele.arrival_time === time) {
      elements.add_to_q.push(ele);
    } else {
      elements.available_processes.push(ele);
    }
  });
  return elements;
};

let columnKeys = [
  "process_id",
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
