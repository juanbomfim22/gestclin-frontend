import React, {useEffect, useState} from "react";
import { FlatList } from "react-native";
import AlertItem from "../../components/AlertItem";
import { CleanButtonContainer, CleanButtonText, Container, Header, PlusButton, Title, TitleWrapper } from "./styles";
import AntDesing from 'react-native-vector-icons/AntDesign'
import axios from 'axios'
import {BASE_URL, REST_API_KEY, APP_ID} from '@env'
import api from "../../services/api";
import KeyChain, { SharedWebCredentials, UserCredentials } from "react-native-keychain"

// const alerts = [
//     {
//         id: 1,
//         succeed: true,
//         message: "A manutenção da sala 09 foi concluida",
//         time: "1h"
//     },
//     {
//         id: 2,
//         succeed: true,
//         message: "A manutenção da sala 21 foi concluida",
//         time: "3h"
//     },
//     {
//         id: 3,
//         succeed: false,
//         message: "Respirador a espera de reparo na sala 09",
//         time: "1d"
//     },
// ]

const Alert = (props) => {
    const [alerts, setAlerts] = useState([])

    const formatTime = ({sec = 0, min, hour, day, month, year}) => {
        
        const dayNow = new Date().getDay()
        const monthNow = new Date().getMonth()
        const yearNow = new Date().getFullYear()
        const hourNow = new Date().getHours()
        const minNow = new Date().getMinutes()
        const secNow = new Date().getSeconds()

        if(minNow === min 
            && hourNow === hour 
            && dayNow === day 
            && monthNow === month 
            && yearNow === year ) return (secNow - sec) + " s";

        if( hourNow === hour 
            && dayNow === day 
            && monthNow === month 
            && yearNow === year ) return (minNow - min) + " m";

        if( dayNow === day 
            && monthNow === month 
            && yearNow === year ) return (hourNow - hour) + " h";

        if( monthNow === month 
            && yearNow === year ) return (dayNow - day) + " d";

        if(yearNow === year ) return (monthNow - month) + " M";

        return (yearNow - year) + " Y"
    
    }
    // "notifications": [
    //     {
    
    //         "contents": {
    //             "en": "Postman"
    //         },
    //         "converted": 0,
    //         "data": {
    //             "custom_data": "07/05/2022",
    //             "pseudo_attr": "07 de maio de 2022"
    //         },
            
    //         "headings": {
    //             "en": "Teste para inserir data"
    //         },
            
    //     },
    // ]
    useEffect(() => {
        async function render() {
            const info = await KeyChain.getGenericPassword() as UserCredentials;
            try {   
                const {data} = await api.get('/usuarios/busca?email='+ encodeURI(info.username)) 
                setAlerts(data.alertasRecebidos)
            } catch(errors) {
                console.log(errors)
            }
        }
        render();


        // &limit=50&offset=:offset
        const header = {
            headers: {
                Authorization: `Basic ${REST_API_KEY}`
            }
        }
        axios.get(`${BASE_URL}?app_id=${APP_ID}&limit=50`, header)
        .then(results => {
            const notifications = results.data.notifications || []
            const formattedNotifications = notifications.map(notification => {
                return {
                    id: notification.id,
                    message: notification.contents.en,
                    time: formatTime(notification.data),
                    title: notification.headings.en,
                    succeed: notification.data.succeed
                }
            })
            // formattedNotifications.forEach(e => console.log(e))
            setAlerts(formattedNotifications)
        })
        .catch(err => console.log(err))
    }, [])

    const renderItem = ({ item }) => {
    
        return (
            <AlertItem titulo={item.titulo} message={item.descricao} succeed={item.succeed} time={item.envio} />
        );
    };
    

    return (
        <Container>
            <Header>
                <TitleWrapper>
                    <Title>Alertas</Title>
                    <PlusButton 
                        activeOpacity={0.6} 
                        underlayColor="#DDDDDD"  
                        onPress={() => props.navigation.navigate("AlertForm")}
                    >
                        <AntDesing name="plus" color="#000" size={28} />
                    </PlusButton>
                </TitleWrapper>
                <CleanButtonContainer>
                    <CleanButtonText>Limpar alertas</CleanButtonText>
                </CleanButtonContainer>
            </Header>
            <FlatList 
                data={alerts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
        
        </Container>
    )
}

export default Alert