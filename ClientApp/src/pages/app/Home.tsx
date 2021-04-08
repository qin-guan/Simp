import * as React from "react";
import { useEffect, useState } from "react";

import { Heading, Flex, Spinner, Button } from "@chakra-ui/react";

import AppNavBar from "../../components/app/AppNavBar";
import classroomsApi from "../../api/http/Classroom";

import Status from "../../models/Status";
import ClassroomInstance from "../../models/Classroom";
import CreateClassroomModal from "../../components/app/CreateClassroomModal";

const Home = (): React.ReactElement => {
    const [classrooms, setClassrooms] = useState<ClassroomInstance[]>([]);
    const [isCreateClassroomModalOpen, setIsCreateClassroomModalOpen] = useState(false);
    const [status, setStatus] = useState(Status.Loading);

    useEffect(() => {
        const getClassrooms = async () => {
            try {
                const classrooms = await classroomsApi.get();
                setClassrooms(classrooms);
                classrooms.length === 0 ? setStatus(Status.Empty) : setStatus(Status.Done);
            } catch {
                setStatus(Status.Error);
            }
        };

        getClassrooms();
    }, []);
    
    const openCreateClassroomModal = () => setIsCreateClassroomModalOpen(true);
    const closeCreateClassroomModal = () => setIsCreateClassroomModalOpen(false);

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <CreateClassroomModal isOpen={isCreateClassroomModalOpen} onClose={closeCreateClassroomModal}/>
            <AppNavBar/>
            <Flex justifyContent={"center"} alignItems={"center"} style={{ flex: 1 }}>
                {{
                    [Status.Loading]: <Spinner/>,
                    [Status.Empty]: (
                        <Flex direction={"column"} alignItems={"center"}>
                            <Heading size={"lg"}>You are not in any classrooms yet, create one?</Heading>
                            <Button mt={3} onClick={openCreateClassroomModal}>Create classroom</Button>
                        </Flex>
                    ),
                    [Status.Error]: <Heading size={"lg"}>An unknown error occurred</Heading>,
                    [Status.Done]: classrooms.map(classroom => (
                        <div key={classroom.Id}>{classroom.Name}</div>
                    ))
                }[status]}
            </Flex>
        </Flex>
    );
};

export default Home;