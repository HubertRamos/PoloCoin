import { supabase } from '../config/supabase.js';

export async function criarProfessor(name, password) {
    const nomeLimpo = name ? name.trim() : '';
    const senhaLimpa = password ? password.trim() : '';

    if (!nomeLimpo || !senhaLimpa) {
        throw new Error('CAMPOS_VAZIOS');
    }

    // Verifica se o professor já existe no banco
    const { data: existente, error: errExist } = await supabase
        .from('professores')
        .select('id')
        .eq('name', nomeLimpo)
        .maybeSingle();

    if (errExist) {
        throw new Error(errExist.message);
    }

    if (existente) {
        throw new Error('DUPLICADO');
    }

    // Insere se não existir
    const { error: errInsert } = await supabase
        .from('professores')
        .insert([{ name: nomeLimpo, password: senhaLimpa }]);

    if (errInsert) {
        if (errInsert.code === '23505') {
            throw new Error('DUPLICADO');
        }
        throw new Error(errInsert.message);
    }
}

export async function puxarProfessores() {
    const { data, error } = await supabase
        .from('professores')
        .select('id, name');

    if (error) {
        throw new Error(error.message);
    }
    return data || [];
}
