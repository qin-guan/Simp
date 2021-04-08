import * as React from "react";
import LandingNavBar from "../components/landing/LandingNavBar";

import { Flex } from "@chakra-ui/react";

const Landing = (): React.ReactElement => {
    return (
        <Flex direction={"column"}>
            <LandingNavBar/>
        </Flex>
    );
};

export default Landing;