import * as React from "react";
import { useLocation } from "react-router";
import { Flex } from "@chakra-ui/react";

import ClassroomNavBar from "../../components/app/ClassroomNavBar";
import ClassroomInstance from "../../models/Classroom";

const Classroom = (): React.ReactElement | null => {
    const { state } = useLocation<{classroom: ClassroomInstance}>();
    
    if (!state) {
        window.location.href = "/app";
        return null;
    }
    
    const { classroom: { Name } } = state;
    if (!Name) {
        window.location.href = "/app";
        return null;
    }
    
    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <ClassroomNavBar classroomName={Name}/>
        </Flex>
    );
};

export default Classroom;