
import regeneratorRuntime from "regenerator-runtime";

class Utils {
  static *range(count){
    for(var i=0; i<count; i++){
      yield i;
    }
  }
}

module.exports = Utils;