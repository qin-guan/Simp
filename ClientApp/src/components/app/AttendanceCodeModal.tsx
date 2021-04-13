import * as React from "react";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button, Heading, Center
} from "@chakra-ui/react";

import LessonInstance from "../../models/Lesson";
import { useEffect, useState } from "react";

import { getAttendanceCode } from "../../api/http/Lesson";

import ClassroomInstance from "../../models/Classroom";
import Status from "../../models/Status";

interface AttendanceCodeModalProps {
    isOpen: boolean
    onClose: () => void
    classroom: ClassroomInstance
    lesson: LessonInstance
}

const AttendanceCodeModal = (props: AttendanceCodeModalProps): React.ReactElement => {
    const { isOpen, onClose, classroom, lesson } = props;
    
    const [status, setStatus] = useState(Status.Loading);
    const [code, setCode] = useState<number>();
    
    const fetchAttendanceCode = async() => {
        try {
            const res = await getAttendanceCode(classroom.Id, lesson.Id);
            setCode(res);
        } catch {
            setStatus(Status.Error);
        }
    };
    
    useEffect(() => {
        fetchAttendanceCode();
        const timer = setInterval(fetchAttendanceCode, 15000);
        return () => {
            clearInterval(timer);
        };
    }, []);
    
    return (
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay/>
            <ModalContent>
                <ModalCloseButton/>
                <ModalBody p={10}>
                    <Center>
                        <Heading size={"4xl"}>{code}</Heading>
                    </Center>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default AttendanceCodeModal;