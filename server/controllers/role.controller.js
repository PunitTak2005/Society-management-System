import Role from '../model/role.model.js';

export const createRole = async (req, res) => {
  try {
    const { role, roleDescription } = req.body;
    const newRole = await Role.create({ role, roleDescription });
    res.status(201).json({
      message: 'Role created successfully',
      data: newRole,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.status(200).json({ data: roles });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.status(200).json({ data: role });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRole) return res.status(404).json({ message: 'Role not found' });
    res.status(200).json({
      message: 'Role updated successfully',
      data: updatedRole,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) return res.status(404).json({ message: 'Role not found' });
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.json({ error: error.message });
  }
};
