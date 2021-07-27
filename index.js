var data = [];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

async function getData(name) {
  var aux = [];
  var promise = await fetch(`https://api.github.com/users/${name}/repos`);
  var response = await promise.json();
  if (response.message) return response;
  console.log(response);

  response.forEach((it) => {
    var date = new Date(it.created_at);
    const year = date.getFullYear();
    const month = monthNames[date.getMonth()];
    const day = date.getDate();

    if (!aux.some((el) => el.year == year)) {
      aux.push({ year, months: [{ month, repos: [] }] });
    } else {
      var ind = aux.findIndex((el) => el.year == year);
      if (!aux[ind].months.some((el) => el.month == month)) {
        aux[aux.findIndex((el) => el.year == year)].months.push({
          month,
          repos: [],
        });
      }
    }

    var yearAux = aux[aux.findIndex((el) => el.year == year)].months;
    var monthAux = yearAux[yearAux.findIndex((el) => el.month == month)];
    console.log(yearAux, monthAux);
    monthAux.repos.push({
      name: it.name,
      date: `${month.substring(0, 3)} ${day}, ${year}`,
      desc: it.description,
      day: day,
      url: it.html_url
    });
  });

  aux = aux.sort((a, b) => a.year - b.year);
  aux.map((el) => {
    el.months.map((it) => {
      return {
        month: it.month,
        repos: it.repos.sort((a, b) => a.day - b.day),
      };
    });
  });
  console.log(aux);
  return aux;
}

$(document).ready(function () {
  $(".timeline-container").hide();

  $("form").submit(async (e) => {
    e.preventDefault();

    var val = $("input").val();
    var response = await getData(val);
    console.log(response);
    if (!response.message) {
      data = response;
      console.log(data);
      $(".timeline-container").show();
      $("body").addClass("timeline");
      $(window).on("scroll", function (e) {
        // console.log(e.currentTarget.scrollY);
      });
      data.forEach((el, i) => {
        $(".timeline-container").append(
          `<div id="y${i}">
                <div class="timeline-year"> ${el.year}</div>
            </div>`
        );

        el.months.forEach((it, ind) => {
          $("#y" + i).append(
            `<div id="m${ind}y${i}">
                <div class="timeline-month"> ${it.month}</div>
            </div>`
          );
          it.repos.forEach((elem, index) => {
            $("#m" + ind + "y" + i).append(
              `<div id="m${ind}y${i}r${index}">
              <div class="card-line"></div>
                    <a class="timeline-card" href="${elem.url}" target="_blank">
                        <div class="card-name">${elem.name}</div>
                        <div class="card-date">${elem.date}</div>
                        <div class="card-desc">${
                          elem.desc != null ? elem.desc : ""
                        }</div>
                    </a>
                </div>`
            );
          });
        });
      });
      timeline();
      $(window).on("resize", function (e) {
        timeline();
      });
    } else {
      $(".username-container").addClass("error");
      $(".username-title").css("color", "var(--error)");
      $(".username-container").animate({ margin: 0 }, 2000, () => {
        $(".username-container").removeClass("error");
        $(".username-title").css("color", "var(--primary)");
        $("input").val("");
      });
    }
  });
  $(".timeline-back a").click(() => {
    $("input").val("");
    $("body").removeClass("timeline");
    $(".timeline-container").hide();

    for (var i = 0; i < data.length; i++) {
      console.log(i);
      $("#y" + i).remove();
    }
    data = [];
  });
});
function timeline() {
  var side = -1;
  var percent = "50%";
  var lineWidth = 100;
  $(".card-line").css({ width: `100px` });
  if ($(window)[0].outerWidth < 1024) {
    percent = "20%";
    lineWidth = 50;
    $(".card-line").css({ width: `50px` });
  }

  var top = 100;
  $(".timeline-line").css({ top: "100px" });
  $(".timeline-line").css({ height: `0px` });

  data.forEach((el, i) => {
    var width = $("#y" + i + " .timeline-year")[0].offsetWidth;
    $("#y" + i + " .timeline-year").css({
      left: `calc(${percent} - ${width / 2}px)`,
    });
    $("#y" + i + " .timeline-year").css({ top: `${top}px` });
    $(".timeline-line").css({ height: `+=100px` });
    top += 100;
    el.months.forEach((it, ind) => {
      var tag = "#m" + ind + "y" + i;
      var width = $(tag + " .timeline-month")[0].offsetWidth;
      $(tag + " .timeline-month").css({
        left: `calc(${percent} - ${width / 2}px)`,
      });
      $(tag + " .timeline-month").css({ top: `${top}px` });
      $(".timeline-line").css({ height: `+=100px` });
      top += 100;

      it.repos.forEach((elem, j) => {
        var tag = "#m" + ind + "y" + i + "r" + j;

        var width = $(tag + " .timeline-card")[0].offsetWidth;
        var height = $(tag + " .timeline-card")[0].offsetHeight;
        if (side < 0) width = 0;
        $(tag + " .timeline-card").css({
          left: `calc(${percent} - ${(width + lineWidth) * side}px)`,
        });
        $(tag + " .timeline-card").css({ top: `${top}px` });
        $(".timeline-line").css({ height: `+=${height + 100}px` });

        $(tag + " .card-line").css({ top: `${top + height / 2 - 2.5}px` });

        $(tag + " .card-line").css({
          left: `calc(${percent} - ${side < 0 ? 0 : lineWidth * side}px)`,
        });

        top += height + 100;
        if ($(window)[0].outerWidth >= 1024) {
          side *= -1;
        }
      });
    });
  });

  $(".timeline-end").css({ top: `${top}px` });
  $(".timeline-back").css({ top: `${top + 30}px` });
}
