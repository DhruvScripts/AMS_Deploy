const fs = require('fs');
const path = require('path');
const pool = require("../database/index");
const { error } = require('console');

const assetController = {
    getAll: async (req, res) => {
        try {
            const [row, fields] = await pool.query("SELECT * FROM employee INNER JOIN assets ON employee.empid = assets.empid INNER JOIN history ON employee.empid=history.empid");
            const dbFilePath = path.join(__dirname, 'db.json');
            fs.writeFile(dbFilePath, JSON.stringify(row), (err) => {
                if (err) {
                    console.error('Error writing to db.json:', err);
                    return res.status(500).json({ error: 'Error writing to db.json' });
                }
                console.log('Data successfully written to db.json');
                res.json({
                    data: row
                });
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Error fetching data from database' });
        }
    },
    //Add Assets
    create: async (req, res) =>{
        try {
            const {slno, productid, producttype, productmodel, status, empid, productbrand, productserialno} = req.body
            const sql = "insert into assets values(?, ?, ?, ?, ?, ?, ?, ?)"
            const [rows, fields] = await pool.query(sql, [slno, productid, producttype, productmodel, status, null, productbrand, productserialno])
            res.json({
                message: 'Asset created successfully',
                data: rows
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Error creating asset' });
        }
    },  

    // For Dashboard Page
    addAssetAndEmployee : async (req, res) => {
        const { sl_no, product_id, product_type, product_model, status, product_brand, product_serialno, empid, empname, empdesignation, empemailid, laptoppassword, emailpassword, issuedate, returndate } = req.body;
     
        let connection;
        try {
            // Get a connection from the pool
            connection = await pool.getConnection();
     
            // Begin transaction
            await connection.beginTransaction();
     
            // Insert into employee table
            const [employeeResult] = await connection.query('INSERT INTO employee (empid, empname, empdesignation, empemailid, laptoppassword, emailpassword) VALUES (?, ?, ?, ?, ?, ?)',
                [empid, empname, empdesignation, empemailid, laptoppassword, emailpassword]);
     
            // Insert into assets table
            const [assetResult] = await connection.query('INSERT INTO assets (slno, productid, producttype, productmodel, status, empid, productbrand, productserialno) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [sl_no, product_id, product_type, product_model, status, empid, product_brand, product_serialno]);
     
            // Insert into history table
            const [historyResult] = await connection.query('INSERT INTO history (empid, productid, issuedate, returndate) VALUES (?, ?, ?, ?)',
                [empid, product_id, issuedate, returndate]);
     
            // Commit transaction
            await connection.commit();
     
            // Release connection back to the pool
            connection.release();
     
            // Respond with success message
            res.json({
                message: 'Asset and Employee added successfully',
                assetId: assetResult.insertId,
                employeeId: employeeResult.insertId,
                historyId: historyResult.insertId
            });
        } catch (error) {
            // Rollback transaction on error
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error(error);
            res.status(500).json({ error: 'Error adding asset and employee' });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },

    //Individual Table Details
    getData : async (req, res) => {
        try {
            // Query database for assets, employees, and history
            const [assets] = await pool.query('SELECT * FROM assets');
            const [employees] = await pool.query('SELECT * FROM employee');
            const [history] = await pool.query('SELECT * FROM history');
     
            // Structure data for db.json
            const data = {
                assets: assets.map(asset => ({
                    "slno": asset.slno,
                    "productid": asset.productid,
                    "Producttype": asset.producttype,
                    "Productmodel": asset.productmodel,
                    "Productstatus": asset.status,
                    "empid": asset.empid,
                    "productbrand": asset.productbrand,
                    "productserialno": asset.productserialno
                })),
                employee: employees.map(employee => ({
                    "empid": employee.empid,
                    "empname": employee.empname,
                    "empdesignation": employee.empdesignation,
                    "empemailid": employee.empmailid,
                    "laptoppassword": employee.laptoppassword,
                    "emailpassword": employee.emailpassword
                })),
                history: history.map(record => ({
                    "empid": record.empid,
                    "productid": record.productid,
                    "issuedate": record.issuedate,
                    "returndate": record.returndate
                }))
            };
     
            // Write data to db.json file
            const filePath = path.join(__dirname, '..', 'db.json');
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
     
            // Respond with data as JSON
            res.json({ data });
        } catch (error) {
            console.error(error); 
            res.status(500).json({ error: 'An error occurred while fetching data.' });
        }
    },

    editAll: async (req, res) => {
        const { empid, empname, empdesignation, empemailid, laptoppassword, emailpassword, slno, productid, producttype, productmodel, status, productbrand, productserialno, issuedate, returndate } = req.body;

        let connection;
        try {
            connection = await pool.getConnection();

            await connection.beginTransaction();

            // Update employee table if fields are present
            if (empid && (empname || empdesignation || empemailid || laptoppassword || emailpassword)) {
                const sqlEmployee = `
                    UPDATE employee 
                    SET empname = COALESCE(?, empname),
                        empdesignation = COALESCE(?, empdesignation),
                        empemailid = COALESCE(?, empemailid),
                        laptoppassword = COALESCE(?, laptoppassword),
                        emailpassword = COALESCE(?, emailpassword)
                    WHERE empid = ?`;

                const [employeeResult] = await connection.query(sqlEmployee, [empname, empdesignation, empemailid, laptoppassword, emailpassword, empid]);

                if (employeeResult.affectedRows === 0) {
                    throw new Error('Employee not found');
                }
            }

            // Update assets table if fields are present
            if (slno && (productid || producttype || productmodel || status || empid || productbrand || productserialno)) {
                const sqlAssets = `
                    UPDATE assets 
                    SET productid = COALESCE(?, productid),
                        producttype = COALESCE(?, producttype),
                        productmodel = COALESCE(?, productmodel),
                        status = COALESCE(?, status),
                        empid = COALESCE(?, empid),
                        productbrand = COALESCE(?, productbrand),
                        productserialno = COALESCE(?, productserialno)
                    WHERE slno = ?`;

                const [assetResult] = await connection.query(sqlAssets, [productid, producttype, productmodel, status, empid, productbrand, productserialno, slno]);

                if (assetResult.affectedRows === 0) {
                    throw new Error('Asset not found');
                }
            }

            // Update history table if fields are present
            if (empid && productid && (issuedate || returndate)) {
                const sqlHistory = `
                    UPDATE history 
                    SET issuedate = COALESCE(?, issuedate),
                        returndate = COALESCE(?, returndate)
                    WHERE empid =  AND productid = ?`;

                const [historyResult] = await connection.query(sqlHistory, [issuedate, returndate, empid, productid]);

                if (historyResult.affectedRows === 0) {
                    throw new Error('History record not found');
                }
            }

            await connection.commit();
            connection.release();

            res.json({
                message: 'Records updated successfully'
            });
        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error(error);
            res.status(500).json({ error: 'Error updating records' });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },


//Search API
globalSearch: async (req, res) => {
    const { searchTerm, page = 1, limit = 4 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const query = `
            SELECT 
                e.empid, e.empname, e.empdesignation, e.empemailid,
                a.slno, a.productid, a.producttype, a.productmodel, a.status, a.productbrand, a.productserialno,
                h.issuedate, h.returndate
            FROM 
                employee e
            INNER JOIN 
                assets a ON e.empid = a.empid
            INNER JOIN 
                history h ON e.empid = h.empid
            WHERE 
                e.empid LIKE ? OR e.empname LIKE ? OR e.empdesignation LIKE ? OR e.empemailid LIKE ? OR
                a.productid LIKE ? OR a.producttype LIKE ? OR a.productmodel LIKE ? OR a.status LIKE ? OR a.productbrand LIKE ? OR a.productserialno LIKE ? OR
                h.productid LIKE ? OR h.issuedate LIKE ? OR h.returndate LIKE ?
            LIMIT ? OFFSET ?
        `;

        const searchTermPattern = `%${searchTerm}%`;
        const [results] = await pool.query(query, [
            searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern,
            searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern,
            searchTermPattern, searchTermPattern, searchTermPattern, parseInt(limit), parseInt(offset)
        ]);

        // Query to get the total number of matching records
        const [totalRecords] = await pool.query(`
            SELECT COUNT(*) AS count 
            FROM 
                employee e
            INNER JOIN 
                assets a ON e.empid = a.empid
            INNER JOIN 
                history h ON e.empid = h.empid
            WHERE 
                e.empid LIKE ? OR e.empname LIKE ? OR e.empdesignation LIKE ? OR e.empemailid LIKE ? OR
                a.productid LIKE ? OR a.producttype LIKE ? OR a.productmodel LIKE ? OR a.status LIKE ? OR a.productbrand LIKE ? OR a.productserialno LIKE ? OR
                h.productid LIKE ? OR h.issuedate LIKE ? OR h.returndate LIKE ?
        `, [
            searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern,
            searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern,
            searchTermPattern, searchTermPattern, searchTermPattern
        ]);

        const totalPages = Math.ceil(totalRecords[0].count / limit);

        res.json({
            message: 'Global search results',
            data: results,
            currentPage: parseInt(page),
            totalPages: totalPages,
            totalRecords: totalRecords[0].count
        });
    } catch (error) {
        console.error('Error during global search:', error);
        res.status(500).json({ error: 'Error performing global search' });
    }
},
  

      // Pagination API For Asset.
      paginateAssets: async (req, res) => {
        const { page = 1, limit = 4 } = req.query;
        const offset = (page - 1) * limit;
    
        try {
          const [results] = await pool.query("SELECT * FROM assets ORDER BY slno ASC LIMIT ? OFFSET ?", [parseInt(limit), parseInt(offset)]);
          
          // Get the total number of records to calculate total pages
          const [totalResults] = await pool.query("SELECT COUNT(*) as count FROM assets");
          const totalRecords = totalResults[0].count;
          const totalPages = Math.ceil(totalRecords / limit);
    
          res.json({
            data: results,
            pagination: {
              totalRecords,
              totalPages,
              currentPage: parseInt(page),
              pageSize: parseInt(limit)
            }
          });
        } catch (error) {
          console.error('Error fetching paginated assets:', error);
          res.status(500).json({ error: 'Error fetching paginated assets from database' });
        }
      },    


      // Pagination method for dashboard
      paginateDashboard: async (req, res) => {
        const { page = 1, limit = 4 } = req.query;
        const offset = (page - 1) * limit;
      
        try {
          const [results] = await pool.query(
            `SELECT 
              e.empid, e.empname, e.empdesignation, e.empemailid, e.laptoppassword, e.emailpassword,
              a.slno, a.productid, a.producttype, a.productmodel, a.status, a.productbrand, a.productserialno,
              h.issuedate, h.returndate
            FROM 
              employee e
            INNER JOIN assets a ON e.empid = a.empid
            INNER JOIN history h ON e.empid = h.empid
            GROUP BY 
              e.empid, a.slno, h.issuedate, h.returndate
            ORDER BY 
              e.empid
            LIMIT ? OFFSET ?`, 
            [parseInt(limit), parseInt(offset)]
          );
      
          const [totalRecords] = await pool.query(`SELECT COUNT(*) AS count FROM employee 
            INNER JOIN assets ON employee.empid = assets.empid 
            INNER JOIN history ON employee.empid = history.empid`);
      
          const totalPages = Math.ceil(totalRecords[0].count / limit);
      
          res.json({
            data: results,
            currentPage: parseInt(page),
            totalPages: totalPages,
            totalRecords: totalRecords[0].count
          });
        } catch (error) {
          console.error('Error fetching paginated data for dashboard:', error);
          res.status(500).json({ error: 'Error fetching paginated data for dashboard from database' });
        }
      },

      productIdValidation:async(req, res) => {
        const {productid} = req.body
        let connection
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            if(productid){
                const query = "SELECT COUNT(*) as totalNumber FROM assets WHERE productid = ? "
                const [val] = await connection.query(query, productid);
 
                const totalRow = {
                    totalNumber: val[0].totalNumber
                  };
                console.log(totalRow.totalNumber);
                if(totalRow.totalNumber > 0){
                    res.json({
                        message: true
                    });
                }else{
                    res.json({
                        message: false
                    });
                }
            }
            await connection.commit();
            connection.release();
           
        } catch (error) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error(error);
            res.status(500).json({ error: error.message });
        } finally {
            if (connection) {
                connection.release();
            }
        }
    },
      
      // Creting a serch for the asset.
      globalSearchAssets: async (req, res) => {
        const { searchTerm, page = 1, limit = 4 } = req.query;
        const offset = (page - 1) * limit;
    
        try {
            const query = `
                SELECT DISTINCT
                    a.slno, a.productid, a.producttype, a.productmodel, a.status, a.productbrand, a.productserialno
                FROM 
                    assets a
                WHERE 
                    a.productid LIKE ? OR a.producttype LIKE ? OR a.productmodel LIKE ? OR a.status LIKE ? OR a.productbrand LIKE ? OR a.productserialno LIKE ?
                LIMIT ? OFFSET ?
            `;
    
            const searchTermPattern = `%${searchTerm}%`;
            const [results] = await pool.query(query, [
                searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern,
                searchTermPattern, searchTermPattern, parseInt(limit), parseInt(offset)
            ]);
    
            // Query to get the total number of matching records
            const [totalRecords] = await pool.query(`
                SELECT COUNT(DISTINCT a.slno) AS count 
                FROM 
                    assets a
                WHERE 
                    a.productid LIKE ? OR a.producttype LIKE ? OR a.productmodel LIKE ? OR a.status LIKE ? OR a.productbrand LIKE ? OR a.productserialno LIKE ?
            `, [
                searchTermPattern, searchTermPattern, searchTermPattern, searchTermPattern,
                searchTermPattern, searchTermPattern
            ]);
    
            const totalPages = Math.ceil(totalRecords[0].count / limit);
    
            res.json({
                message: 'Global search results for assets',
                data: results,
                currentPage: parseInt(page),
                totalPages: totalPages,
                totalRecords: totalRecords[0].count
            });
        } catch (error) {
            console.error('Error during global search for assets:', error);
            res.status(500).json({ error: 'Error performing global search for assets' });
        }
    }
    
    }
module.exports = assetController;
