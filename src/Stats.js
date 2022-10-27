import {
  Box,
  Typography,
  Table,
  TableContainer,
  Paper,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Tooltip,
  Fade,
} from "@mui/material";
import * as React from "react";
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

function Stats() {
  const [letters, setLetters] = React.useState({
    w: 0,
    i: 0,
    n: 0,
    g: 0,
    s: 0
  });
  const [top, setTop] = React.useState("");
  const [errmsg, setErrmsg] = React.useState("");
  const [beg, setBeg] = React.useState("---");
  const [end, setEnd] = React.useState("---");
  const [prize, setPrize] = React.useState("---");
  const [total, setTotal] = React.useState("---");
  const [hmsrc, setHmsrc] = React.useState([
    { date: '2022-10-10', count: 1 },
    { date: '2022-10-11', count: 2 },
    { date: '2022-10-12', count: 3 },
  ]);
  const [helper, setHelper] = React.useState("");
  const [oleaders, setOleaders] = React.useState([]);

  const updateStats = () => {
    try {
      fetch("https://jt-carrier-default-rtdb.firebaseio.com/letters.json")
        .then((response) => response.json())
        .then((data) => setLetters(data));

      fetch("https://jt-carrier-default-rtdb.firebaseio.com/top.json")
        .then((response) => response.json())
        .then((data) => setTop(data));

    } catch (err) {
      setErrmsg("Something went wrong...our server might be busy!");
    }
  };

  // updateStats();
  React.useEffect(() => {
    setInterval(updateStats, 60000);

    updateStats();
    fetch("https://wings-carrier.herokuapp.com/dates/current")
    .then((response) => response.json())
    .then((data) => {
      setBeg(data.beg);
      setEnd(data.end);
      setPrize(data.prize);
    });

    fetch("https://wings-carrier.herokuapp.com/stats/total")
    .then((response) => response.json())
    .then((data) => {
      setTotal(data.total);
    });

    fetch("https://wings-carrier.herokuapp.com/stats/heatmap")
    // only once on load, get heatmap generated by backend
    // list of objects with date and count fields
    .then((response) => response.json())
    .then((data) => {
      const maxct = Math.max(...data.heatmap.map(day=>day.count));
      const quartile = Math.ceil(maxct / 5);
      // Parse heatmap src to be a count from 0 to 4, inclusive,
      // but still include raw count for tooltip
      const parsedhm = data.heatmap.map((day)=>{
        return {"date": day.date, "rawct": day.count, "count": Math.floor(day.count/quartile)};
      });
      setHmsrc(parsedhm);
    });

    fetch("https://wings-carrier.herokuapp.com/stats/hr")
    // only once on load, get orange tickets Leaderboard
    // as a list of lists [hr_teacher, count]
    .then((response) => response.json())
    .then((data) => {setOleaders(data.top5);});

  }, []);

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column"
    }}>
      <Typography variant="h5" sx={rowStyle}>WINGS Ticket Stats</Typography>
      <Typography variant="h6">Ticket count for the week from {beg} to {end}</Typography>
      <Typography variant="h6">{errmsg}</Typography>

      <TableContainer component={Paper} sx={rowStyle}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{  fontWeight: "bold" }}
                align="center"
              >
                W
              </TableCell>
              <TableCell
                sx={{  fontWeight: "bold" }}
                align="center"
              >
                I
              </TableCell>
              <TableCell
                sx={{  fontWeight: "bold" }}
                align="center"
              >
                N
              </TableCell>
              <TableCell
                sx={{  fontWeight: "bold" }}
                align="center"
              >
                G
              </TableCell>
              <TableCell
                sx={{  fontWeight: "bold" }}
                align="center"
              >
                S
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell align="center">
                {letters["w"]}
              </TableCell>
              <TableCell align="center">
                {letters["i"]}
              </TableCell>
              <TableCell align="center">
                {letters["n"]}
              </TableCell>
              <TableCell align="center">
                {letters["g"]}
              </TableCell>
              <TableCell align="center">
                {letters["s"]}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6">This week's homeroom drawing prize is: {prize}</Typography>

      <Typography variant="h6" sx={rowStyle}>
        Cutoff for TOP 25%: {top} tickets
      </Typography>

      <Typography variant="h6" sx={rowStyle}>
        Orange Tickets Homeroom Leaderboard:
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 350 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }} align="left">
                Place
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="left">
                Teacher
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="left">
                Count
              </TableCell>
            </TableRow>
          </TableHead>


          <TableBody>
            {oleaders.map((hr, index) => (
              <TableRow>
                <TableCell>{index+1}</TableCell>
                <TableCell>{hr[0]}</TableCell>
                <TableCell>{hr[1]}</TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      <Typography variant="h6" sx={rowStyle}>
        So far this year, we've validated {total} tickets
      </Typography>

      <Tooltip
        open={helper!==""}
        title={helper}
        followCursor
        TransitionComponent={Fade}
      >
        <Box sx={{height: "50px"}}>
          <CalendarHeatmap
            startDate={new Date('2022-08-18')}
            endDate={new Date()}
            values={hmsrc}
            classForValue={value => {
              if (!value) {
                return 'color-empty';
              }
              return `color-github-${value.count}`;
            }}
            showWeekdayLabels={true}
            onMouseOver={(event, value)=>{
              // Open Tooltip
              setHelper(`${value.rawct} tickets submitted on ${value.date}`);
            }}
            onMouseLeave={()=>setHelper("")}
            weekdayLabels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          />
        </Box>
      </Tooltip>

    </Box>
  );
}

const rowStyle = {
  width: "100%",
  flexGrow: "row",
  display: "flex",
  marginTop: 3,
};

export default Stats;
