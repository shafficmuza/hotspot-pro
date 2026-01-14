import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Users from './components/Users';
import Plans from './components/Plans';
import Payments from './components/Payments';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/users">Users</Link></li>
            <li><Link to="/plans">Plans</Link></li>
            <li><Link to="/payments">Payments</Link></li>
          </ul>
        </nav>
        <Switch>
          <Route path="/users" component={Users} />
          <Route path="/plans" component={Plans} />
          <Route path="/payments" component={Payments} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
