import React, {useState, useActionState, useEffect, useContext} from 'react';
import ProfileHeader from './ProfileHeader';
import FieldRow from './FieldRow';
import ButtonSave from './ButtonSave';
import { useQuery } from '@tanstack/react-query';
import { axProfileEdit, axProfileUpdate } from '../AxiosFunctions';
import { PulseLoader } from 'react-spinners';
import { DataContext } from '../../context/DataContext';


const ProfileInformation = () => {
    const {dataContext, setDataContext} = useContext(DataContext);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [user, setUser] = useState({
        name: '',
        email: '',
    });

    
    const {data, error, isLoading} = useQuery({
        queryKey: ['profile', localStorage.getItem('token'), dataContext.userName],
        queryFn: async () => await axProfileEdit(),
        staleTime: 0,
        cacheTime: 0,
        refetchOnMount: 'always',
        networkMode: 'always'
    });

    

    useEffect(() => {
        if (data) {
            setUser(data.data);
        }
    }, [data]);
    
   

    const [success, formAction, isPending] = useActionState(async (previousState, formData)=>{
        const email = formData.get('email')
        const name = formData.get('name')
        setUser({name, email})
        setErrorMsg('')

        return await axProfileUpdate({name, email})
            .then(res => {
                if (res) {
                    setUser(res.data);
                    localStorage.setItem('name', res.data.name)
                    setDataContext({...dataContext, userName: res.data.name});
                    return "Updated!";
                }
            })
            .catch(err => {
                setErrorMsg(err)
            })
    }, '');

    useEffect(() => {
        if (success && !isPending) {
            setSuccessMsg(success);
            const timer = setTimeout(() => {
                setSuccessMsg('');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [success, isPending]);

    

    return (
    <div className="p-4 sm:p-8 bg-white border sm:rounded-lg">
        <div className="max-w-xl">
        <section>
        
        <ProfileHeader 
            title="Profile Information" 
            description="Update your account's profile information and email address." />

        {isLoading ?  
            <PulseLoader color="#0d6efd" size={12} className="ml-4 mt-1" /> :
            <PorfileForm formAction={formAction} user={user} errorMsg={errorMsg} isPending={isPending} successMsg={successMsg} />
        }

        </section>

        </div>
    </div>
    );
}

export default ProfileInformation;

const PorfileForm = ({formAction, user, errorMsg, isPending, successMsg}) => {
    return (
        <form action={formAction} className="mt-6 space-y-6">
            
            {errorMsg && <div className="text-danger mx-2 mt-1">{errorMsg}</div>}

            <FieldRow title="Name" name="name"  value={user.name}/>
            <FieldRow title="Email" name="email"  value={user.email}/>
           
           <div className="flex">
            {isPending? <PulseLoader color="#0d6efd" size={12} className="ml-4 mt-1" /> :
            <ButtonSave /> 
            }
            {successMsg && <div className="text-success fw-bold mx-2 mt-1">{successMsg}</div>}
            </div>
        </form>
    )
}