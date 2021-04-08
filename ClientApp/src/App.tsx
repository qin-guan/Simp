import React from "react";
import {
    BrowserRouter as Router,
} from "react-router-dom";

import { ChakraProvider, Flex } from "@chakra-ui/react";

import Routes from "./routes";

function App(): React.ReactElement {
    return (
        <ChakraProvider>
            <Router>
                <Flex w={"100vw"} h={"100vh"} direction={"column"}>
                    <Routes/>
                </Flex>
            </Router>
        </ChakraProvider>
    );
}

export default App;
