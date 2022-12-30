import React, { useState, useEffect, useRef } from "react";
import ReactLoading from "react-loading";
import axios from "axios";
import Modal from "react-modal";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Button, Typography, TextField } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// code sort from MUI sorting
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const headCells = [
    {
      id: "name",
      label: "Pokemon Name",
    },
  ];

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function PokeDex() {
  const [pokemons, setPokemons] = useState([]);
  const [pokemonDetail, setPokemonDetail] = useState(null);
  const [pokemonCount, setPokemonCount] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = React.useState(1);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  useEffect(() => {
    setIsLoading(true);
    getPokemonList(`https://pokeapi.co/api/v2/pokemon`);
  }, []);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "white",
      color: "black",
      border: "2px solid black",
    },
    overlay: { backgroundColor: "#618833" },
  };

  const printRef = useRef();
  const handleDownloadPdf = async () => {
    html2canvas(printRef.current, {
      logging: true,
      letterRendering: 1,
      allowTaint: false,
      useCORS: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      console.log("imgData :", imgData);
      const pdf = new jsPDF();
      console.log(pdf);
      pdf.addImage(imgData, "PNG", 0, 0, 0, 0);
      pdf.save("download.pdf");
    });
  };

  //Get pokemon list from Api
  const getPokemonList = async (url) => {
    try {
      const response = await axios.get(url);
      console.log("response", response);
      setPokemons(response.data.results);
      setPokemonCount(response.data.count);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  //Get choose pokemon data from Api
  const getChoosePokemonData = async (url) => {
    try {
      const response = await axios.get(url);
      console.log("response", response.data);
      setPokemonDetail(response.data);
    } catch (error) {}
  };

  // handle change page
  const handleChange = (event, value) => {
    setPage(value);
    setIsLoading(true);
    getPokemonList(
      `https://pokeapi.co/api/v2/pokemon?offset=${value + 1}&limit=20`
    ).then(() => setIsLoading(false));
  };

  // filter the search pokemon
  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  if (!isLoading && pokemons.length === 0) {
    return (
      <div>
        <header className="App-header">
          <h1>Welcome to pokedex !</h1>
          <h2>Requirement:</h2>
          <ul>
            <li>
              Call this api:https://pokeapi.co/api/v2/pokemon to get pokedex,
              and show a list of pokemon name.
            </li>
            <li>Implement React Loading and show it during API call</li>
            <li>
              when hover on the list item , change the item color to yellow.
            </li>
            <li>when clicked the list item, show the modal below</li>
            <li>
              Add a search bar on top of the bar for searching, search will run
              on keyup event
            </li>
            <li>Implement sorting and pagingation</li>
            <li>Commit your codes after done</li>
            <li>
              If you do more than expected (E.g redesign the page / create a
              chat feature at the bottom right). it would be good.
            </li>
          </ul>
        </header>
      </div>
    );
  }

  return (
    <div>
      <header className="App-header">
        {isLoading ? (
          <>
            <div className="App">
              <header className="App-header">
                {/* <b>Implement loader here</b> */}
                <ReactLoading
                  type="bubbles"
                  color="#fff"
                  height={64}
                  width={64}
                />
              </header>
            </div>
          </>
        ) : (
          <>
            <h1>Welcome to pokedex !</h1>
            {/* <b>Implement Pokedex list here</b> */}
            <TextField
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Pokémon"
              variant="filled"
              sx={{ backgroundColor: "white", borderRadius: "5px" }}
            />
            <TableContainer
              sx={{
                width: "13%",
                backgroundColor: "white",
                mb: "30px",
                mt: "12px",
              }}
            >
              <Table>
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={handleRequestSort}
                  rowCount={filteredPokemons.length}
                />
                <TableBody>
                  {stableSort(
                    filteredPokemons,
                    getComparator(order, orderBy)
                  ).map((p, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div
                          key={p.name}
                          style={{
                            color: hoveredIndex === index ? "#ffc107" : "black",
                            cursor: "pointer",
                          }}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => {
                            getChoosePokemonData(p.url);
                          }}
                        >
                          {p.name}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack spacing={2}>
              <Typography fontSize={16} align="center">
                Page: {page}
              </Typography>
              <Pagination
                count={Math.ceil(pokemonCount / 20)}
                page={page}
                onChange={handleChange}
                sx={{ pb: "32px" }}
              />
            </Stack>
          </>
        )}
      </header>
      {pokemonDetail && (
        <div>
          <Modal
            isOpen={pokemonDetail !== null}
            contentLabel={pokemonDetail?.name || ""}
            onRequestClose={() => {
              setPokemonDetail(null);
            }}
            ariaHideApp={false}
            style={customStyles}
          >
            <Grid
              container
              direction="row"
              justifyContent="flex-end"
              sx={{
                fontWeight: "bold",
                fontSize: 30,
              }}
            >
              <Button
                variant="outlined"
                sx={{ color: "gray" }}
                onClick={() => handleDownloadPdf()}
              >
                download as pdf
              </Button>
            </Grid>
            <div ref={printRef}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: 30,
                }}
              >
                {pokemonDetail.name}
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
                ref={printRef}
              >
                <img
                  src={pokemonDetail.sprites.front_default}
                  alt={pokemonDetail.name}
                  style={{
                    height: "150px",
                    width: "150px",
                  }}
                />
              </Box>
              <Box ref={printRef}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "15%", fontWeight: "bold" }}>
                          Stat
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pokemonDetail.stats.map((stat) => (
                        <TableRow key={stat.stat.name}>
                          <TableCell>{stat.stat.name}</TableCell>
                          <TableCell>
                            <Box>
                              {stat.base_stat}
                              <LinearProgress
                                color="success"
                                key={stat.stat.name}
                                variant="determinate"
                                value={stat.base_stat / 1.5}
                                style={{
                                  width: "100%",
                                  height: 20,
                                  marginBottom: "12px",
                                }}
                              ></LinearProgress>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </div>
            {/* <div>
            Requirement:
            <ul>
              <li>show the sprites front_default as the pokemon image</li>
              <li>
                Show the stats details - only stat.name and base_stat is
                required in tabular format
              </li>
              <li>Create a bar chart based on the stats above</li>
              <li>
                Create a buttton to download the information generated in this
                modal as pdf. (images and chart must be included)
              </li>
            </ul>
          </div> */}
          </Modal>
        </div>
      )}
    </div>
  );
}

export default PokeDex;
