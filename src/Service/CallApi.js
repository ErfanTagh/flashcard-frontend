
export async function getAllUsers() {

    try{
        const response = await fetch('/api/users/');
        return await response.json();
    }catch(error) {
        return [];
    }

}

export async function getWords() {
    const response = await fetch(`/api/words/rand/`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}})

    return await response.json();
}
