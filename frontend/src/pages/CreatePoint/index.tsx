import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import {FiArrowLeft} from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';

import axios from 'axios';
import api from '../../services/api';


import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint = ()=>{
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const history = useHistory();

    useEffect(() => {
        api.get('items').then((res)=> {
            setItems(res.data);
        });
    }, []);

    useEffect(()=>{
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(res => {
                const ufInitials = res.data.map(uf => uf.sigla);
                
                setUfs(ufInitials);
            });
            
    }, []);

    useEffect(()=>{
        if(selectedUf === '0'){
            return;
        }

        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(res => {
                const CityNames= res.data.map(city => city.nome);
                setCities(CityNames);
            });

    }, [selectedUf]);

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position=>{
            const {latitude, longitude} = position.coords;

            setInitialPosition([latitude, longitude])
        });
    }, []);

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectedCities(event: ChangeEvent<HTMLSelectElement>){
        const cities = event.target.value;
        setSelectedCities(cities);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData({ ...formData, [name]: value});
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
        
        if(alreadySelected >= 0){
            const filtreredItems = selectedItems.filter(item => item !== id);
            
            setSelectedItems(filtreredItems);
        }else{
            setSelectedItems([ ...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCities;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }

        await api.post('points', data);
        alert('Ponto de Coleta Cadastrado com Sucesso!');
        history.push('/');
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
            
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>
                        <h1>Cadastro do <br/> ponto de coleta</h1>
                    </legend>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf}
                                onChange={handleSelectedUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf=>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city" 
                                value={selectedCities}
                                onChange={handleSelectedCities}
                            >
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city=>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Items de Coleta</h2>
                        <span>Selecione um ou mais items</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>
                        ))}
                        
                        
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar Ponto de Coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;