import * as React from "react";
import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    Button,
    IconButton,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverHeader,
    PopoverCloseButton,
    PopoverBody,
    Popover, PopoverFooter
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

import lessonsApi from "../../../api/http/lessons";

import User from "../../../models/User";
import Classroom from "../../../models/Classroom";
import Lesson from "../../../models/Lesson";

interface AttendeeListModalProps {
    isOpen: boolean;
    classroom: Classroom;
    lesson: Lesson;
    attendees: User[];

    onClose: () => void;
    reloadAttendees: () => void;
    reloadAttendance: () => void;
}

const AttendeeListModal = (props: AttendeeListModalProps): React.ReactElement => {
    const { isOpen, onClose, attendees, classroom, lesson, reloadAttendees, reloadAttendance } = props;

    const deleteUserAttendance = async (userId: string) => {
        await lessonsApi.deleteAttendance(classroom.Id, lesson.Id, userId);

        reloadAttendees();
        reloadAttendance();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={"5xl"}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>
                    Attendees
                    <IconButton ml={3} aria-label={"Reload"} icon={<RepeatIcon/>} onClick={reloadAttendees}/>
                </ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Id</Th>
                                <Th>Email</Th>
                                <Th>Absent</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {attendees.map((attendee, idx) => (
                                <Tr key={idx.toString()}>
                                    <Td>
                                        {attendee.Id}
                                    </Td>
                                    <Td>
                                        {attendee.Name}
                                    </Td>
                                    <Td>
                                        <Popover>
                                            <PopoverTrigger>
                                                <Button colorScheme={"red"}>Mark absent</Button>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <PopoverArrow/>
                                                <PopoverCloseButton/>
                                                <PopoverHeader>Confirmation!</PopoverHeader>
                                                <PopoverBody>
                                                    Are you sure you want to delete this users attendance? They
                                                    will have to manually mark their attendance again!
                                                </PopoverBody>
                                                <PopoverFooter>
                                                    <Button colorScheme={"red"}
                                                        onClick={async () => await deleteUserAttendance(attendee.Id)}>Confirm</Button>
                                                </PopoverFooter>
                                            </PopoverContent>
                                        </Popover>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default AttendeeListModal;