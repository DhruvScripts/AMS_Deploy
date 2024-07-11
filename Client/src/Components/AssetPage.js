import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { Edit, Add, Search } from "@mui/icons-material";
import Navbar from "./Navbar";
import "../CssFiles/Table.css";
import axios from "axios";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssetPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const [newProduct, setNewProduct] = useState({
    slno: "",
    productid: "",
    producttype: "Laptop",
    productmodel: "",
    status: "Active",
    productbrand: "",
    productserialno: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [open, setOpen] = useState(false);


  const fetchProduct = async (pageToFetch) => {
    try {
      const response = await axios.get("http://localhost:8000/api/v1/asset/paginateAsset", {
        params: {
          page: pageToFetch,
          limit,
        },
      
      });
      setProducts(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.log(error);
      setProducts([]); // Ensure products is always an array
    }
  };


  const fetchSearchResults = async (pageToFetch, searchTermToUse) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`http://localhost:8000/api/v1/asset/searchAsset`, {
        params: {
          page: pageToFetch,
          limit,
          searchTerm: searchTermToUse
        },
      
      });
      setProducts(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  }

  
  const handleSearch = () => {
    setPage(1);
    setSearchTriggered(true);
    fetchSearchResults(1, searchTerm);
  };
  
    useEffect(() => {
       if (searchTriggered) {
        fetchSearchResults(page, searchTerm);
      } else {
        fetchProduct(page);
      }
    }, [page, searchTriggered]);

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchTerm(value);
  };
  const handleEnterKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Backspace' && searchTerm === '') {
      fetchProduct(1); // Fetch dashboard data when backspace clears search term
    }
  };
 
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredProducts = products.filter((product) =>
    Object.values(product).some(
      (value) =>
        value && value.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAdd = async () => {
    if (editingProduct) {
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id ? newProduct : product
        )
      );
    } else {
      try {
        console.log("New Product:", newProduct); // Log the new product data
       
        await axios.post("http://localhost:8000/api/v1/asset/assets", newProduct, {
          
        });
        setProducts([...products, { ...newProduct, id: products.length + 1 }]);
        fetchProduct(page);
        setOpen(false);
      } catch (error) {
        console.log(error);
      }
    }
    setOpen(false);
    setNewProduct({
      slno: "",
      productid: "",
      producttype: "Laptop",
      productmodel: "",
      status: "Active",
      empid: "",
      productbrand: "",
      productserialno: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Available":
        return "blue";
      case "Defective":
        return "red";
      default:
        return "black";
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setOpen(true);
  };

  return (
    <>
     <div className="navbar-fixed">
        <Navbar />
      </div>
      <ToastContainer />
      <div className="searchbar-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ flexGrow: 1 }}>
            <TextField
              variant="outlined"
              placeholder="Search..."
              size="small"
              onChange={handleSearchChange}
              InputProps={{ startAdornment: <Search /> }}
              onKeyDown={handleEnterKeyPress}
              style={{ marginRight: '10px' }}
            />
            <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
          >
            Search
          </Button>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClickOpen}
            startIcon={<Add />}
            style={{ marginLeft: 'auto' }}
          >
            Add New
          </Button>
        </div>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please fill in the details of the {editingProduct ? "product" : "new product"}.
          </DialogContentText>
          {['productid', 'productmodel', 'productbrand', 'productserialno'].map((field) => (
            <TextField
              key={field}
              margin="dense"
              name={field}
              label={field.split(/(?=[A-Z])/).join(' ')}
              type="text"
              fullWidth
              value={newProduct[field]}
              onChange={handleChange}
              style={{ marginBottom: '8px' }}
            />
          ))}
          <Select
            margin="dense"
            name="producttype"
            value={newProduct.producttype}
            onChange={handleChange}
            fullWidth
            style={{ marginBottom: '8px' }}
          >
            <MenuItem value="Laptop">Laptop</MenuItem>
            <MenuItem value="Charger">Charger</MenuItem>
            <MenuItem value="Mouse">Mouse</MenuItem>
            <MenuItem value="Headset">Headphone</MenuItem>
          </Select>
          <Select
            margin="dense"
            name="status"
            value={newProduct.status}
            onChange={handleChange}
            fullWidth
            style={{ marginBottom: '8px' }}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="Defective">Defective</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAdd} color="primary">
            {editingProduct ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <div className="table-wrapper">
        <TableContainer component={Paper} className="table-container">
          <Table className="table-containers table-fixed-header">
            <TableHead className="header-section">
              <TableRow>
                {[
                  "SI No.",
                  "Product ID",
                  "Product Type",
                  "Product Model",
                  "Product Brand",
                  "Product SerialNo",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <TableCell
                    key={header}
                    style={{ whiteSpace: "pre-line", padding: "16px" }}
                  >
                    {header.split(" ").join("\n")}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.productid}>
                  <TableCell style={{ padding: "16px" }}>
                    {product.slno}
                  </TableCell>
                  <TableCell style={{ padding: "16px" }}>
                    {product.productid}
                  </TableCell>
                  <TableCell style={{ padding: "16px" }}>
                    {product.producttype}
                  </TableCell>
                  <TableCell style={{ padding: "16px" }}>
                    {product.productmodel}
                  </TableCell>
                  <TableCell style={{ padding: "16px" }}>
                    {product.productbrand}
                  </TableCell>
                  <TableCell style={{ padding: "16px" }}>
                    {product.productserialno}
                  </TableCell>
                  <TableCell
                    style={{
                      padding: "16px",
                      color: getStatusColor(product.status),
                    }}
                  >
                    {product.status}
                  </TableCell>
                  <TableCell style={{ padding: "16px", display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <div className="pagination-fixed">
        <Pagination
          color="primary"
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
              {...item}
            />
          )}
        />
      </div>
    </>
  );
};

export default AssetPage;




//  -------- PENDING -------------
 // I remove the token out of the code..
 // I also didn't add the azure auth..