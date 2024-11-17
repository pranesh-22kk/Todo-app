import { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Delete, CheckCircleOutline, AddCircleOutline } from "@mui/icons-material";
import { Container, Row, Col, Card, Button, Form, Dropdown } from "react-bootstrap";
import { Bar } from "react-chartjs-2"; // Only import it once
import "bootstrap/dist/css/bootstrap.min.css";
import "chart.js/auto"; // Import for chart.js
import './Todo.css'; // Import the CSS file for styles

function Todo() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");
  const [theme, setTheme] = useState("day");
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    fetchTodos();
    const timer = setInterval(() => setDateTime(new Date()), 1000); // Update time every second
    return () => clearInterval(timer);
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await axios.get("/api/todos");
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    if (!text) return;
    try {
      const res = await axios.post("/api/todos", {
        text,
        completed: false,
        category,
        dueDate,
      });
      setTodos([...todos, res.data]);
      setText("");
      setCategory("Personal");
      setDueDate("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const todo = todos.find((todo) => todo._id === id);
      const res = await axios.put(`/api/todos/${id}`, { completed: !todo.completed });
      setTodos(todos.map((todo) => (todo._id === id ? res.data : todo)));
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const changeTheme = (newTheme) => setTheme(newTheme);

  const completedCount = todos.filter(todo => todo.completed).length;

  const data = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        label: "Tasks",
        data: [completedCount, todos.length - completedCount],
        backgroundColor: ["#28a745", "#dc3545"],
        borderColor: ["#28a745", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container fluid className={`p-5 bg-${theme}`}>
      <Row className="mb-4 text-center">
        <Col className="text-dark">
          <h1 className="display-4 animate-title">Task Manager</h1>
          <p className="lead">{dateTime.toLocaleDateString()} | {dateTime.toLocaleTimeString()}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col className="d-flex justify-content-end">
          <Dropdown onSelect={changeTheme}>
            <Dropdown.Toggle variant="secondary" id="theme-dropdown">
              Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="day">☀️ Day</Dropdown.Item>
              <Dropdown.Item eventKey="night">🌙 Night</Dropdown.Item>
              <Dropdown.Item eventKey="dark">🖤 Dark</Dropdown.Item>
              <Dropdown.Item eventKey="sunset">🌅 Sunset</Dropdown.Item>
              <Dropdown.Item eventKey="forest">🌲 Forest</Dropdown.Item>
              <Dropdown.Item eventKey="ocean">🌊 Ocean</Dropdown.Item>
              <Dropdown.Item eventKey="lavender">💜 Lavender</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row className="justify-content-center mb-4">
        <Col md={6}>
          <Card className="p-4 shadow animate-card">
            <Card.Title>Add New Task</Card.Title>
            <Form>
              <Form.Group controlId="taskText" className="mb-3">
                <Form.Label>Task</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter task description"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="animate-input"
                />
              </Form.Group>
              <Form.Group controlId="taskCategory" className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Personal">🏠 Personal</option>
                  <option value="Work">💼 Work</option>
                  <option value="Shopping">🛒 Shopping</option>
                  <option value="Fitness">🏋️‍♂️ Fitness</option>
                  <option value="Finance">💰 Finance</option>
                  <option value="Others">📋 Others</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="taskDueDate" className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" className="w-100 animate-btn" onClick={addTodo}>
                <AddCircleOutline className="me-2" /> Add Task
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={{ span: 10, offset: 1 }}>
          <Card className="p-4 shadow animate-card">
            <Card.Title>
              Task List <span className="text-muted">({todos.length})</span>
            </Card.Title>
            {todos.length ? (
              <ul className="list-group list-group-flush">
                {todos.map((todo) => (
                  <li
                    key={todo._id}
                    className={`list-group-item d-flex justify-content-between align-items-center animate-list ${todo.completed ? "bg-success text-decoration-line-through text-white" : ""}`}
                  >
                    <div>
                      <strong>{todo.text}</strong>
                      <br />
                      <small className="text-muted">
                        Category: {todo.category} | Due: {todo.dueDate || "N/A"}
                      </small>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant={todo.completed ? "outline-light" : "outline-secondary"}
                        size="sm"
                        onClick={() => toggleComplete(todo._id)}
                      >
                        {todo.completed ? <CheckCircle /> : <CheckCircleOutline />}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteTodo(todo._id)}
                      >
                        <Delete />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted">No tasks added yet!</p>
            )}
          </Card>
        </Col>
      </Row>

      <Row className="mt-4 text-center">
        <Col>
          <h5>Total Tasks: {todos.length}</h5>
          <h5>Completed Tasks: {completedCount}</h5>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Bar data={data} />
        </Col>
      </Row>
    </Container>
  );
}

export default Todo;
