// import { Button } from '@chakra-ui/react';
import { Route } from 'react-router-dom';
import './App.css';
import Chatpage from './pages/chatpage';
import homepage from './pages/homepage';

function App() {
  return (
    <div className="App">
      <Route path="/" component={homepage} exact />
      <Route path="/chats" component={Chatpage} />
    </div>
  );
}

export default App;
