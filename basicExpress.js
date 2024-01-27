const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs =require('fs');

// Create a single variable to reference the SQLite database connection
const db = new sqlite3.Database('userdata.db');
app.set('view engine', 'ejs');
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
// Set the path to the directory containing your HTML files
const publicPath = path.join(__dirname);

// Create the 'user' table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        password TEXT
    )
`);

// Serve static files from the 'public' directory
app.use(express.static(publicPath));
app.use(express.json());
// Define a route for the '/demo.html' URL
app.get('/demo.html', (req, res) => {

    // console.log(req.query.id);
    // res.send(req.query);
    // Use 'res.sendFile' to send the HTML file
    res.sendFile(path.join(publicPath, 'demo.html'));
});

// Handle form submission
app.post('/submit', (req, res) => {
    const { name, email, password } = req.body;
    db.run('INSERT INTO user (name, email, password) VALUES (?, ?, ?)', [name, email, password], function (err) {
        if (err) {
            console.error('Error in database', err);
            res.status(500).send('Server error');
        } else {
            console.log('Form data added to the database. Row ID:', this.lastID);
            res.send(`Form submitted successfully. Name: ${name}, Email: ${email}, Password: ${password} 
            
            `);
        }
    });

    db.all('SELECT *FROM user', [], (err, row) => {
        if (err) {
            throw err;
        }
        console.log('All USER DATA');
        console.log(row);
        // row.forEach(rows => {
        //     console.log(`${rows.name}-${rows.email}-${rows.password}`);
        // });

    });
});

app.get('/allUsers', (req, res) => {

    // res.send("Hello all users.");
    // document.write("Hello all users.");
    var resp = '<table border="1"><tr><th>Name</th><th>Email</th><th>Password</th></tr>';
    db.all('SELECT * FROM user', [], (err, row) => {
        if (err) {
            throw err;
        }
        // console.log('All USER DATA');
        // console.log(row);
        row.forEach(rows => {
            resp += (`<tr><td>${rows.name}</td>
            <td>${rows.email}</td>
            <td>${rows.password}</td>

            <td>
                       <a href="/editUser?id=${rows.id}">Edit</a>
                       <a href="/deleteUser?id=${rows.id}" onclick="return confirm('Are you sure you want to delete this user?')">Delete</a>                       
                    </td>
            </tr>`);
        });
        resp += '</table>';

        res.send(resp);
    });

    app.get('/editUser', (req, res) => {
        const userId = req.query.id;
        // console.log(req.query.id);

        //fetch record
        db.get("SELECT * FROM user WHERE id = ?", [userId], function (err, row) {
            if (err) {
                console.error("Fetching User data err.", err);
                res.status(500).send('Server Side Error');
            } if (!row) {
                res.status(400).send('User Not Found');
                return;
            }
            fs.readFile('editForm.html', 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading editForm.html:', err);
                    res.status(500).send('Server error');
                    return;
                }
                // Replace placeholders with actual user data
                const formHtml = data
                    .replace('{{userId}}', userId)
                    .replace('{{name}}', row.name)
                    .replace('{{email}}', row.email)
                    .replace('{{password}}', row.password);
                // Send the HTML form template with existing user data to the client
                res.send(formHtml);
            });
        });
    });

    app.post('/updateUser', (req, res) => {
    // Extract data from the request body
    const { id, name, email, password } = req.body;

    // Update user data in the database
    db.run('UPDATE user SET name=?, email=?, password=? WHERE id=?', [name, email, password, id], (err) => {
        if (err) {
            console.error('Error updating user:', err);
            res.status(500).send('Server error');
            return;
        }
        console.log('User updated successfully!');
        // Redirect to a success page or send a response indicating success
        res.redirect('/allUsers');
    });
});


    app.get('/deleteUser', (req, res) => {
        const id = req.query.id;
        // res.send(req.query.id);
        db.run('DELETE FROM user WHERE id = ? ', [id], function (err) {
            // db.all('SELECT * FROM user',[], function (err,row) {
            if (err) {
                console.error('User Side Error', err)
                res.status(500).send('server error');
                return;
            }
            // res.send(row);
            // console.log(row);
            console.log((' Data Delete Sucessfully ', id))
            // res.send('User Delete succesfully');
            res.redirect('/allUsers');
        });
    });
});