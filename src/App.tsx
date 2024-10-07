import React, {useEffect} from 'react';
import './App.css';
import {useForm} from "react-hook-form";
import {toast} from "react-toastify";

interface ITodo {
    id: number;
    title: string;
    completed: boolean;
}
function App() {
    const [todos, setTodos] = React.useState<ITodo[]>([]);
    const {register, handleSubmit, reset} = useForm();
    const [currentTodo, setCurrentTodo] = React.useState<ITodo | any>();

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('http://localhost:3000/todos');
                const data = await res.json();
                setTodos(data);
                console.log(data);
            } catch (e) {
                console.log(e);
            }
        })();
    }, []);

    const onHandleSubmit = async (data: any) => {
        try {
            const res = await fetch('http://localhost:3000/todos', {
                method: 'POST',
                body: JSON.stringify({...data, completed: false}),
                headers: {'Content-Type': 'application/json'}
            });

            if (res.status !== 201) return toast.error(res.status);

            const result = await res.json();
            setTodos([...todos, result]);
            toast.success("Add a new todo successfully!");
            reset();
        } catch (err) {
            console.log(err);
        }
    };
    const handleRemove = async (id: number) => {
        const confirm = window.confirm("Are you sure you want to delete it?");
        if (confirm) {
            try {
                const res = await fetch(`http://localhost:3000/todos/${id}`, {
                    method: 'DELETE'
                });
                if (res.status !== 200) {
                    return alert("Remove todo failed");
                }
                alert("Deleting the todo successfully!");
                setTodos(todos.filter((todo) => todo.id !== id));
            } catch (e) {
                console.log(e);
            }
        }
    };
    const handleSave = async (data: any) => {
        if (!currentTodo) return;
        try {
            const res = await fetch(`http://localhost:3000/todos/${currentTodo.id}`, {
                method: 'PUT',
                body: JSON.stringify({...currentTodo, title: data.title2}),
                headers: {'Content-Type': 'application/json'}
            });

            if (res.status !== 200) return toast.error(res.status);

            const result = await res.json();
            setTodos(todos.map((todo) => (todo.id === result.id ? result : todo)));
            toast.success("Update todo successfully!");
            setCurrentTodo(null);  // Reset currentTodo
            reset();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="App">
            <h2>Add a new todo</h2>
            <form onSubmit={handleSubmit(onHandleSubmit)}>
                <input type='text' {...register('title')} />
                <button type='submit'>Add a new todo</button>
            </form>
            <ul>
                {todos.map((todo: ITodo) => (
                    <li key={todo.id} style={{listStyle:'none'}}>
                        {currentTodo?.id === todo.id ? (
                            <form onSubmit={handleSubmit(handleSave)}>
                                <input type="text" {...register("title2")} />
                                <button type="submit">Save</button>
                                <button type="button" onClick={() => setCurrentTodo(null)}>Cancel</button>
                            </form>
                        ) : (
                            <>
                                <span
                                    onClick={() => {
                                        reset({
                                            title2: todo.title
                                        });
                                        setCurrentTodo(todo);
                                    }}
                                >
                                    {todo.title}
                                </span>
                                <button onClick={() => handleRemove(todo.id)}>Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;

