import { Component } from "react";
import head from "./assets/coin_head.jpg";
import tail from "./assets/coin_tail.jpg";

class Coin extends Component {
  static defaultProps = {
    head,
    tail,
    face: "head",
  };

  render() {
    return (
      <div className="Coin">
        <img src={this.props[this.props.face]} alt={this.props.face} draggable="false" />
      </div>
    );
  }
}

export default Coin;
