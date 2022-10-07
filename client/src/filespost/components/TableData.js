import React, { useState, useContext } from "react";

import { useTheme } from "@mui/material/styles";
import PropTypes from "prop-types";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableFooter,
  makeStyles,
} from "@material-ui/core";
import {
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage,
} from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import DownloadFileLink from "./DownloadFileLink";
import { AuthContext } from "../../shared/context/auth-context";
import TableButtonActions from "./TableButtonActions";

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPage /> : <LastPage />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default function TableData({ items }, props) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage1, setRowsPerPage1] = useState(5);
  const auth = useContext(AuthContext);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage1 - items.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage1(parseInt(event.target.value, 10));
    setPage(0);
  };

  const tableHeaders = [
    {
      id: "title",
      label: "Title",
    },
    {
      id: "description",
      label: "Description",
    },
    {
      id: "creator",
      label: "Created By",
    },
    {
      id: "file",
      label: "File",
    },
    {
      id: "actions",
      label: "Actions",
    },
  ];

  const useStyles = makeStyles((theme) => ({
    table: {
      minWidth: 300,
      margin: "0 auto",
      maxWidth: 1000,
      backgroundColor: "rgba(66, 122, 161, 0.2)",
      borderRadius: 5,
    },
    tableHeaderCell: {
      fontWeight: "bold",
      backgroundColor: "#427aa1",
    },
    tableHead: {
      color: "#fff",
    },
    tableRowRole: {
      textTransform: "capitalize",
    },
  }));

  const classes = useStyles();
  return (
    <div>
      <TableContainer>
        <Table className={classes.table}>
          <TableHead className={classes.tableHeaderCell}>
            <TableRow>
              {tableHeaders.map((tableHead) => (
                <TableCell key={tableHead.id} className={classes.tableHead}>
                  {tableHead.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              .slice(page * rowsPerPage1, page * rowsPerPage1 + rowsPerPage1)
              .map((data) => (
                <TableRow key={data.id}>
                  <TableCell>{data.title}</TableCell>
                  <TableCell>{data.description}</TableCell>
                  <TableCell className={classes.tableRowRole}>
                    {data.creator.name}
                  </TableCell>
                  <TableCell>
                    <DownloadFileLink fileId={data.id} fileName={data.file} />
                  </TableCell>
                  {(auth.userId === data.creator._id || auth.isAdmin) && (
                    <TableCell>
                      <TableButtonActions
                        data={data}
                        onDelete={props.onDeleteFile}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5]}
                colSpan={3}
                count={items.length}
                rowsPerPage={rowsPerPage1}
                page={page}
                SelectProps={{
                  inputProps: {
                    "aria-label": "rows per page",
                  },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </div>
  );
}
